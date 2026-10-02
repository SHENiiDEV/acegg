<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public const PAGES = [
        'terms' => 'Terms & Conditions',
        'privacy' => 'Privacy Policy',
        'cookies' => 'Cookie Policy',
        'payments-refunds' => 'Payments & Refunds',
        'kyc-aml' => 'KYC & AML Policy',
        'social-casino-rules' => 'Social Casino Rules',
        'responsible-gaming' => 'Responsible Gaming',
    ];

    public function show(string $page): Response
    {
        abort_unless(array_key_exists($page, self::PAGES), 404);

        return Inertia::render('legal/show', [
            'page' => $page,
            'title' => self::PAGES[$page],
            'pages' => self::PAGES,
            'updatedAt' => '2026-10-01',
            'restrictedCountries' => collect(config('countries.restricted'))
                ->map(fn ($code) => \App\Support\Countries::name($code) ?? $code)->sort()->values(),
            'lottery' => [
                'ticket_price' => (int) config('casino.lottery.ticket_price'),
                'pick' => (int) config('casino.lottery.pick'),
                'max_number' => (int) config('casino.lottery.max_number'),
            ],
        ]);
    }
}
