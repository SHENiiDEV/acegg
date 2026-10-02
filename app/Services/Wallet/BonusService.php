<?php

namespace App\Services\Wallet;

use App\Models\User;
use App\Models\WalletTransaction;

class BonusService
{
    public function __construct(private readonly WalletService $wallet) {}

    public function grantWelcomeBonus(User $user): void
    {
        $amount = (int) config('casino.welcome_bonus');
        if ($amount > 0) {
            $this->wallet->credit($user, $amount, WalletTransaction::WELCOME_BONUS, 'welcome-'.$user->id);
        }
    }

    public function canClaimDaily(User $user): bool
    {
        return $user->daily_bonus_claimed_at === null
            || $user->daily_bonus_claimed_at->lt(now()->subDay());
    }

    public function nextDailyAt(User $user): ?string
    {
        return $this->canClaimDaily($user) ? null : $user->daily_bonus_claimed_at?->addDay()->toIso8601String();
    }

    public function claimDaily(User $user): bool
    {
        if (! $this->canClaimDaily($user)) {
            return false;
        }

        $user->forceFill(['daily_bonus_claimed_at' => now()])->save();
        $this->wallet->credit($user, (int) config('casino.daily_bonus'), WalletTransaction::DAILY_BONUS, 'daily-'.$user->id.'-'.now()->format('YmdHis'));

        return true;
    }
}
