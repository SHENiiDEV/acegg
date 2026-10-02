<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\Wallet\BonusService;
use Illuminate\Auth\Events\Registered;

class GrantWelcomeBonus
{
    public function __construct(private readonly BonusService $bonuses) {}

    public function handle(Registered $event): void
    {
        if ($event->user instanceof User) {
            $this->bonuses->grantWelcomeBonus($event->user);
        }
    }
}
