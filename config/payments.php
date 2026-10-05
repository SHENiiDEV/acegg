<?php

return [
    /*
    | Payment driver: "sandbox" (test checkout, for development) or the name of a
    | real gateway you add in app/Payments/Gateways and register below.
    */
    'driver' => env('PAYMENT_DRIVER', 'sandbox'),

    // Sandbox may run in production when enabled or when driver is sandbox.
    'sandbox_in_production' => (bool) env('PAYMENT_SANDBOX_IN_PRODUCTION', true),

    'gateways' => [
        'sandbox' => App\Payments\Gateways\SandboxGateway::class,
    ],

    'currency' => env('TOPUP_CURRENCY', 'GBP'),
    'currency_symbol' => env('TOPUP_CURRENCY_SYMBOL', '£'),

    // Coins (minor units) per 1 cent paid (fallback)
    'coins_per_cent' => (int) env('TOPUP_COINS_PER_CENT', 12_000),

    // Custom amount limits, in cents (fallback)
    'min_amount' => (int) env('TOPUP_MIN', 400),
    'max_amount' => (int) env('TOPUP_MAX', 85_000),
    'daily_limit' => (int) env('TOPUP_DAILY_LIMIT', 170_000),

    // Package definitions
    'packages' => [
        ['id' => 'starter', 'name' => 'Starter', 'bonus' => 0, 'badge' => null],
        ['id' => 'basic', 'name' => 'Basic', 'bonus' => 10, 'badge' => null],
        ['id' => 'popular', 'name' => 'Popular', 'bonus' => 20, 'badge' => 'Most popular'],
        ['id' => 'pro', 'name' => 'Pro', 'bonus' => 30, 'badge' => null],
        ['id' => 'highroller', 'name' => 'High Roller', 'bonus' => 40, 'badge' => 'Best value'],
        ['id' => 'whale', 'name' => 'Whale', 'bonus' => 50, 'badge' => null],
    ],

    /*
    | Supported currencies with fixed exchange rates, package prices and coins calculation.
    */
    'currencies' => [
        'GBP' => [
            'code' => 'GBP',
            'symbol' => '£',
            'name' => 'GBP (£)',
            'coins_per_cent' => 12_000,
            'min_amount' => 400,
            'max_amount' => 85_000,
            'daily_limit' => 170_000,
            'presets' => [10, 25, 50, 100],
            'prices' => [
                'starter' => 450,
                'basic' => 900,
                'popular' => 2250,
                'pro' => 4500,
                'highroller' => 9000,
                'whale' => 22500,
            ],
        ],
        'EUR' => [
            'code' => 'EUR',
            'symbol' => '€',
            'name' => 'EUR (€)',
            'coins_per_cent' => 10_000,
            'min_amount' => 500,
            'max_amount' => 100_000,
            'daily_limit' => 200_000,
            'presets' => [15, 30, 75, 150],
            'prices' => [
                'starter' => 500,
                'basic' => 1000,
                'popular' => 2500,
                'pro' => 5000,
                'highroller' => 10000,
                'whale' => 25000,
            ],
        ],
        'USD' => [
            'code' => 'USD',
            'symbol' => '$',
            'name' => 'USD ($)',
            'coins_per_cent' => 9_500,
            'min_amount' => 500,
            'max_amount' => 100_000,
            'daily_limit' => 200_000,
            'presets' => [15, 30, 75, 150],
            'prices' => [
                'starter' => 550,
                'basic' => 1100,
                'popular' => 2750,
                'pro' => 5500,
                'highroller' => 11000,
                'whale' => 27500,
            ],
        ],
    ],
];

