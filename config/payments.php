<?php

return [
    /*
    | Payment driver: "sandbox" (test checkout, for development) or the name of a
    | real gateway you add in app/Payments/Gateways and register below.
    */
    'driver' => env('PAYMENT_DRIVER', 'sandbox'),

    // Sandbox may never run in production unless explicitly allowed.
    'sandbox_in_production' => (bool) env('PAYMENT_SANDBOX_IN_PRODUCTION', false),

    'gateways' => [
        'sandbox' => App\Payments\Gateways\SandboxGateway::class,
        // 'mygateway' => App\Payments\Gateways\MyGateway::class,
    ],

    'currency' => env('TOPUP_CURRENCY', 'EUR'),
    'currency_symbol' => env('TOPUP_CURRENCY_SYMBOL', '€'),

    // Coins (minor units) per 1 cent paid. 10_000 → €1 = 1,000,000 minor = 10,000 coins.
    'coins_per_cent' => (int) env('TOPUP_COINS_PER_CENT', 10_000),

    // Custom amount limits, in cents.
    'min_amount' => (int) env('TOPUP_MIN', 500),
    'max_amount' => (int) env('TOPUP_MAX', 100_000),
    // Max total paid per rolling 24h, in cents (responsible spending).
    'daily_limit' => (int) env('TOPUP_DAILY_LIMIT', 200_000),

    // Fixed packages. price in cents; bonus in % on top of the base coins.
    'packages' => [
        ['id' => 'starter', 'name' => 'Starter', 'price' => 500, 'bonus' => 0, 'badge' => null],
        ['id' => 'basic', 'name' => 'Basic', 'price' => 1000, 'bonus' => 10, 'badge' => null],
        ['id' => 'popular', 'name' => 'Popular', 'price' => 2500, 'bonus' => 20, 'badge' => 'Most popular'],
        ['id' => 'pro', 'name' => 'Pro', 'price' => 5000, 'bonus' => 30, 'badge' => null],
        ['id' => 'highroller', 'name' => 'High Roller', 'price' => 10000, 'bonus' => 40, 'badge' => 'Best value'],
        ['id' => 'whale', 'name' => 'Whale', 'price' => 25000, 'bonus' => 50, 'badge' => null],
    ],
];
