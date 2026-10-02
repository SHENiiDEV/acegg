<?php

return [
    /*
    | Social casino settings. All amounts are integers in minor units
    | (1 coin = 100 units), the same as the SpinKit API.
    */
    'currency_label' => env('CASINO_CURRENCY_LABEL', 'Coins'),

    // Logos shown in the footer (files in public/images/payments/<name>.png).
    // Only list marks you are actually entitled to display (e.g. PCI DSS only when certified).
    'payment_logos' => array_filter(explode(',', env('PAYMENT_LOGOS', 'visa,mastercard,pci-dss'))),

    // Coins credited once to every new account.
    'welcome_bonus' => (int) env('CASINO_WELCOME_BONUS', 500_000),

    // Daily free top-up when the balance drops below this amount.
    'daily_bonus' => (int) env('CASINO_DAILY_BONUS', 100_000),

    // Prefix for SpinKit external player ids: "{prefix}{user_id}".
    'player_prefix' => env('CASINO_PLAYER_PREFIX', 'acegg-'),

    // How long the SpinKit games list is cached (seconds).
    'games_cache_ttl' => (int) env('CASINO_GAMES_CACHE_TTL', 300),

    /*
    | VIP Club. XP = coins wagered in SpinKit games (1 XP per 1 coin).
    | reward / mission amounts are in minor units.
    */
    'vip' => [
        'levels' => [
            ['name' => 'Bronze', 'xp' => 0, 'cashback' => 2, 'reward' => 0, 'color' => '#d08a4e'],
            ['name' => 'Silver', 'xp' => 5_000, 'cashback' => 3, 'reward' => 100_000, 'color' => '#c3cad6'],
            ['name' => 'Gold', 'xp' => 25_000, 'cashback' => 5, 'reward' => 500_000, 'color' => '#ffc83d'],
            ['name' => 'Platinum', 'xp' => 100_000, 'cashback' => 7, 'reward' => 2_000_000, 'color' => '#7fe3ff'],
            ['name' => 'Diamond', 'xp' => 500_000, 'cashback' => 10, 'reward' => 10_000_000, 'color' => '#c084fc'],
        ],
        'missions' => [
            // Wager this many coins today (minor units) → reward.
            'daily_wager' => ['target' => 1_000_000, 'reward' => 100_000],
            // Play on this many different days in the current week → reward.
            'weekly_activity' => ['target' => 3, 'reward' => 250_000],
        ],
        // Cashback is paid on net losses since the last claim, at most once per 7 days.
        'cashback_period_days' => 7,
    ],

    /*
    | Hourly lottery: pick 5 numbers out of 1..36. Amounts in minor units.
    */
    'lottery' => [
        'ticket_price' => (int) env('LOTTERY_TICKET_PRICE', 10_000_000), // 100,000 coins
        'max_tickets_per_round' => (int) env('LOTTERY_MAX_TICKETS', 10),
        'pick' => 5,
        'max_number' => 36,
        'seed_pool' => (int) env('LOTTERY_SEED_POOL', 100_000_000), // house seed per round
        'pool_share' => 0.9, // share of ticket sales added to the prize pool
        // Share of the pool paid to each tier (split between winners in the tier).
        'tiers' => [5 => 0.5, 4 => 0.25, 3 => 0.15],
        // Fixed prize for 2 matches (refund-like), paid from the house.
        'fixed' => [2 => 2_000_000],
    ],
];
