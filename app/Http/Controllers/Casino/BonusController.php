<?php

namespace App\Http\Controllers\Casino;

use App\Http\Controllers\Controller;
use App\Models\LotteryRound;
use App\Models\WalletTransaction;
use App\Services\Vip\VipService;
use App\Services\Wallet\BonusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BonusController extends Controller
{
    public function index(Request $request, BonusService $bonuses, VipService $vip): Response
    {
        $user = $request->user();
        $bonusTypes = [WalletTransaction::WELCOME_BONUS, WalletTransaction::DAILY_BONUS, WalletTransaction::VIP_REWARD, WalletTransaction::CASHBACK, WalletTransaction::LOTTERY_WIN];

        return Inertia::render('casino/bonuses', [
            'welcome' => [
                'amount' => (int) config('casino.welcome_bonus'),
                'claimed' => $user ? $user->walletTransactions()->where('type', WalletTransaction::WELCOME_BONUS)->exists() : false,
            ],
            'daily' => [
                'amount' => (int) config('casino.daily_bonus'),
                'available' => $user ? $bonuses->canClaimDaily($user) : false,
                'next_at' => $user ? $bonuses->nextDailyAt($user) : null,
            ],
            'vip' => $user ? (function () use ($vip, $user) {
                $o = $vip->overview($user);

                return [
                    'level' => $o['levels'][$o['level']],
                    'cashback' => $o['cashback'],
                    'unclaimed_levels' => collect($o['levels'])->filter(fn ($l) => $l['reached'] && ! $l['reward_claimed'])->count(),
                    'missions_ready' => collect($o['missions'])->filter(fn ($m) => $m['action'] === 'claim' && ! $m['claimed'] && $m['progress'] >= $m['target'])->count(),
                ];
            })() : null,
            'lottery' => ($r = LotteryRound::where('status', 'open')->latest('id')->first()) ? [
                'pool' => $r->pool,
                'draws_at' => $r->draws_at->toIso8601String(),
                'ticket_price' => (int) config('casino.lottery.ticket_price'),
            ] : null,
            'history' => $user ? $user->walletTransactions()->whereIn('type', $bonusTypes)->latest('id')->limit(12)
                ->get(['id', 'type', 'amount', 'created_at']) : [],
        ]);
    }

    public function daily(Request $request, BonusService $bonuses): RedirectResponse
    {
        $claimed = $bonuses->claimDaily($request->user());

        Inertia::flash('toast', $claimed
            ? ['type' => 'success', 'message' => 'Daily bonus credited!']
            : ['type' => 'error', 'message' => 'Daily bonus is already claimed. Come back later.']);

        return back();
    }
}
