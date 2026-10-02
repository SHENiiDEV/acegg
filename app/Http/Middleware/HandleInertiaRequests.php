<?php

namespace App\Http\Middleware;

use App\Services\Vip\VipService;
use App\Services\Wallet\BonusService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'wallet' => fn () => $request->user() ? [
                'balance' => $request->user()->balance,
                'in_game' => $request->user()->isInGame(),
                'daily_bonus_available' => app(BonusService::class)->canClaimDaily($request->user()),
                'daily_bonus_amount' => (int) config('casino.daily_bonus'),
                'vip_level' => app(VipService::class)->levels()[app(VipService::class)->levelIndex($request->user()->vip_xp)],
            ] : null,
            'notifications' => fn () => $request->user() ? ['unread' => $request->user()->unreadNotifications()->count()] : null,
            'casino' => [
                'currency' => config('casino.currency_label'),
                'welcome_bonus' => (int) config('casino.welcome_bonus'),
                'daily_bonus' => (int) config('casino.daily_bonus'),
                'payment_logos' => array_values(config('casino.payment_logos')),
            ],
            'company' => [
                'name' => config('company.name'),
                'number' => config('company.number'),
                'address' => config('company.address'),
                'email' => config('company.email'),
                'jurisdiction' => config('company.jurisdiction'),
            ],

        ];
    }
}
