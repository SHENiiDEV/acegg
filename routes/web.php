<?php

use App\Http\Controllers\Casino\BonusController;
use App\Http\Controllers\Casino\LobbyController;
use App\Http\Controllers\Casino\LotteryController;
use App\Http\Controllers\Casino\PlayController;
use App\Http\Controllers\Casino\TopupController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Casino\VipController;
use App\Http\Controllers\LegalController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LobbyController::class, 'home'])->name('home');
Route::get('games', [LobbyController::class, 'games'])->name('games');
Route::get('legal/{page}', [LegalController::class, 'show'])->name('legal');
Route::get('vip', [VipController::class, 'show'])->name('vip');
Route::get('lottery', [LotteryController::class, 'show'])->name('lottery');
Route::get('bonuses', [BonusController::class, 'index'])->name('bonuses');
Route::get('topup', [TopupController::class, 'index'])->name('topup');

// Payment provider callbacks (no session / CSRF).
Route::post('payments/webhook', [TopupController::class, 'webhook'])
    ->name('payments.webhook')
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);

Route::middleware('auth')->group(function () {
    Route::get('play/{gameId}', [PlayController::class, 'show'])->name('play.show')
        ->where('gameId', '[A-Za-z0-9_\-]+');
    Route::post('play/leave', [PlayController::class, 'leave'])->name('play.leave');
    Route::get('wallet/balance', [PlayController::class, 'balance'])->name('wallet.balance');
    Route::post('bonus/daily', [BonusController::class, 'daily'])->name('bonus.daily')->middleware('throttle:6,1');
    Route::post('vip/missions/{mission}', [VipController::class, 'claimMission'])->name('vip.mission')
        ->whereIn('mission', ['daily_wager', 'weekly_activity'])->middleware('throttle:20,1');
    Route::post('vip/levels/{level}', [VipController::class, 'claimLevel'])->name('vip.level')->whereNumber('level');
    Route::post('vip/cashback', [VipController::class, 'claimCashback'])->name('vip.cashback')->middleware('throttle:6,1');
    Route::post('lottery/tickets', [LotteryController::class, 'buy'])->name('lottery.buy')->middleware('throttle:30,1');

    Route::post('topup', [TopupController::class, 'store'])->name('topup.store')->middleware('throttle:10,1');
    Route::get('topup/{payment}', [TopupController::class, 'result'])->name('topup.result');
    Route::get('topup/{payment}/sandbox', [TopupController::class, 'sandbox'])->name('topup.sandbox')->middleware('signed');
    Route::post('topup/{payment}/sandbox', [TopupController::class, 'sandboxDecide'])->name('topup.sandbox.decide')->middleware('signed');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/read', [NotificationController::class, 'markAllRead'])->name('notifications.read');

    Route::redirect('dashboard', '/')->name('dashboard');
});

require __DIR__.'/settings.php';
