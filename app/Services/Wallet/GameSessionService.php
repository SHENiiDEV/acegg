<?php

namespace App\Services\Wallet;

use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\SpinKit\SpinKitClient;
use App\Services\Vip\VipService;
use App\Services\SpinKit\SpinKitException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Transfer-wallet flow with SpinKit:
 *   launch: settle old session → deposit whole balance → create session
 *   settle: withdraw whole SpinKit balance → credit coins → revoke session
 */
class GameSessionService
{
    public function __construct(
        private readonly SpinKitClient $spinKit,
        private readonly WalletService $wallet,
    ) {}

    /**
     * @return array<string, mixed> SpinKit session (token, launch_url, ...)
     */
    public function launch(User $user, string $gameId, string $lobbyUrl): array
    {
        return Cache::lock('game-session:'.$user->id, 15)->block(10, function () use ($user, $gameId, $lobbyUrl) {
            $this->guardMerchant();
            $this->settle($user);

            $playerId = $user->spinKitPlayerId();
            $result = $this->spinKit->ensurePlayer($playerId, $user->name);

            // A brand-new SpinKit player must start at 0. If the merchant hands out a
            // starting balance, remove it so it never reaches the user's coins.
            $startBalance = (int) ($result['player']['balance'] ?? 0);
            if ($result['created'] && $startBalance > 0) {
                $this->spinKit->withdraw($playerId, $startBalance, 'sweep-'.$user->id.'-'.Str::ulid());
                Log::warning('SpinKit player was created with a starting balance; swept it.', ['user' => $user->id, 'amount' => $startBalance]);
            }

            $user->refresh();
            $amount = $user->balance;

            if ($amount > 0) {
                $txId = 'in-'.$user->id.'-'.Str::ulid();
                // Debit first so coins can never exist in both places; refund on failure.
                $this->wallet->debit($user, $amount, WalletTransaction::GAME_IN, $txId, $gameId);

                try {
                    $this->spinKit->deposit($playerId, $amount, $txId);
                } catch (SpinKitException $e) {
                    $this->wallet->credit($user, $amount, WalletTransaction::GAME_OUT, $txId.'-refund', $gameId);

                    throw $e;
                }
            }

            $session = $this->spinKit->createSession($playerId, $user->name, $gameId, $lobbyUrl);

            $user->forceFill([
                'game_session_token' => $session['token'],
                'game_session_game_id' => $gameId,
            ])->save();

            return $session;
        });
    }

    /**
     * The transfer wallet only works if SpinKit never mints credits on its own.
     * A merchant with demo_refill gives every player free credits (and an in-game
     * refill button) — withdrawing those would print coins, so refuse to launch.
     */
    private function guardMerchant(): void
    {
        $merchant = $this->spinKit->merchant();

        if (! empty($merchant['demo_refill'])) {
            Log::error('SpinKit merchant has demo_refill enabled — disable it in SpinKit admin → Merchants.');

            throw new SpinKitException('Merchant has demo_refill enabled.', 'MERCHANT_MISCONFIGURED', 409);
        }
    }

    /**
     * Bring coins back from SpinKit. Safe to call any time.
     */
    public function settle(User $user): void
    {
        $playerId = $user->spinKitPlayerId();
        $token = $user->game_session_token;
        $gameId = $user->game_session_game_id;

        if ($token) {
            $this->spinKit->revokeSession($token);
        }

        try {
            $balance = (int) ($this->spinKit->player($playerId)['balance'] ?? 0);
        } catch (SpinKitException $e) {
            if ($e->status === 404) {
                $balance = 0; // player never created
            } else {
                throw $e;
            }
        }

        if ($balance > 0) {
            $txId = 'out-'.$user->id.'-'.Str::ulid();
            $this->spinKit->withdraw($playerId, $balance, $txId);
            $this->wallet->credit($user, $balance, WalletTransaction::GAME_OUT, $txId, $gameId);
        }

        $user->forceFill(['game_session_token' => null, 'game_session_game_id' => null])->save();

        // Rounds played in that session → VIP XP and mission progress.
        try {
            app(VipService::class)->sync($user);
        } catch (SpinKitException $e) {
            Log::warning('VIP sync failed', ['user' => $user->id, 'message' => $e->getMessage()]);
        }
    }

    /** Balance shown in the header while a game is open. */
    public function liveBalance(User $user): int
    {
        if (! $user->isInGame()) {
            return $user->balance;
        }

        try {
            return $user->balance + (int) ($this->spinKit->player($user->spinKitPlayerId())['balance'] ?? 0);
        } catch (SpinKitException) {
            return $user->balance;
        }
    }
}
