<?php

namespace App\Console\Commands;

use App\Services\Lottery\LotteryService;
use Illuminate\Console\Command;

class DrawLottery extends Command
{
    protected $signature = 'lottery:draw';

    protected $description = 'Draw overdue lottery rounds and open the next one';

    public function handle(LotteryService $lottery): int
    {
        $round = $lottery->current();
        $this->info("Open round #{$round->id}, draws at {$round->draws_at->toDateTimeString()}");

        return self::SUCCESS;
    }
}
