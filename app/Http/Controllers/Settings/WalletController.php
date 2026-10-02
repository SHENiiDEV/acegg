<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $transactions = $user->walletTransactions()
            ->latest('id')
            ->paginate(20)
            ->through(fn (WalletTransaction $t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => $t->amount,
                'balance_after' => $t->balance_after,
                'game_id' => $t->game_id,
                'created_at' => $t->created_at?->toIso8601String(),
            ]);

        $totals = $user->walletTransactions()
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        return Inertia::render('settings/wallet', [
            'transactions' => $transactions,
            'stats' => [
                'bonuses' => (int) ($totals[WalletTransaction::WELCOME_BONUS] ?? 0) + (int) ($totals[WalletTransaction::DAILY_BONUS] ?? 0)
                    + (int) ($totals[WalletTransaction::VIP_REWARD] ?? 0) + (int) ($totals[WalletTransaction::CASHBACK] ?? 0),
                // game_in is negative, game_out positive → net result of play
                'net_play' => (int) ($totals[WalletTransaction::GAME_IN] ?? 0) + (int) ($totals[WalletTransaction::GAME_OUT] ?? 0),
            ],
        ]);
    }
}
