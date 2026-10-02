<?php

namespace App\Services\Wallet;

use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Local coin balance. Coins live here while the player is in the lobby
 * and are moved to SpinKit (transfer wallet) while a game is open.
 */
class WalletService
{
    public function credit(User $user, int $amount, string $type, ?string $reference = null, ?string $gameId = null): WalletTransaction
    {
        return $this->apply($user, $amount, $type, $reference, $gameId);
    }

    public function debit(User $user, int $amount, string $type, ?string $reference = null, ?string $gameId = null): WalletTransaction
    {
        return $this->apply($user, -$amount, $type, $reference, $gameId);
    }

    private function apply(User $user, int $delta, string $type, ?string $reference, ?string $gameId): WalletTransaction
    {
        return DB::transaction(function () use ($user, $delta, $type, $reference, $gameId) {
            if ($reference !== null) {
                $existing = WalletTransaction::where('reference', $reference)->first();
                if ($existing) {
                    return $existing; // idempotent
                }
            }

            /** @var User $locked */
            $locked = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $newBalance = $locked->balance + $delta;

            if ($newBalance < 0) {
                throw new InvalidArgumentException('Insufficient balance.');
            }

            $locked->forceFill(['balance' => $newBalance])->save();
            $user->setAttribute('balance', $newBalance);

            return WalletTransaction::create([
                'user_id' => $user->id,
                'type' => $type,
                'amount' => $delta,
                'balance_after' => $newBalance,
                'reference' => $reference,
                'game_id' => $gameId,
            ]);
        });
    }
}
