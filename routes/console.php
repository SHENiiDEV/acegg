<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Hourly lottery: draws overdue rounds and opens the next one.
// Run the scheduler locally with `php artisan schedule:work`.
Illuminate\Support\Facades\Schedule::command('lottery:draw')->everyMinute()->withoutOverlapping();
