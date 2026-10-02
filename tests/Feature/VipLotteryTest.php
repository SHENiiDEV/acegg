<?php

namespace Tests\Feature;

use App\Models\LotteryRound;
use App\Models\LotteryTicket;
use App\Models\User;
use App\Services\Lottery\LotteryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class VipLotteryTest extends TestCase
{
    use RefreshDatabase;

    public function test_vip_bonuses_and_lottery_pages_render_for_guests_and_users(): void
    {
        foreach (['/vip', '/lottery', '/bonuses', '/legal/terms', '/legal/kyc-aml'] as $url) {
            $this->get($url)->assertOk();
        }

        $user = User::factory()->create();
        foreach (['/vip', '/lottery', '/bonuses'] as $url) {
            $this->actingAs($user)->get($url)->assertOk();
        }
    }

    public function test_daily_wager_mission_can_be_claimed_once(): void
    {
        config(['casino.vip.missions.daily_wager' => ['target' => 1000, 'reward' => 500]]);
        $user = User::factory()->create(['balance' => 0]);
        DB::table('player_daily_stats')->insert(['user_id' => $user->id, 'date' => now('UTC')->toDateString(), 'wagered' => 2000, 'won' => 0, 'rounds' => 5]);

        $this->actingAs($user)->post('/vip/missions/daily_wager');
        $this->actingAs($user)->post('/vip/missions/daily_wager');

        $this->assertSame(500, $user->fresh()->balance);
    }

    public function test_level_reward_requires_reaching_the_level(): void
    {
        $user = User::factory()->create(['balance' => 0, 'vip_xp' => 0]);
        $this->actingAs($user)->post('/vip/levels/1');
        $this->assertSame(0, $user->fresh()->balance);

        $user->forceFill(['vip_xp' => 5_000])->save();
        $this->actingAs($user)->post('/vip/levels/1');
        $this->assertSame(config('casino.vip.levels.1.reward'), $user->fresh()->balance);
    }

    public function test_buying_a_ticket_charges_coins_and_validates_numbers(): void
    {
        config(['casino.lottery.ticket_price' => 1000]);
        $user = User::factory()->create(['balance' => 5000]);

        $this->actingAs($user)->post('/lottery/tickets', ['numbers' => [1, 2, 3, 4, 5]]);
        $this->actingAs($user)->post('/lottery/tickets', ['numbers' => [1, 1, 2, 3, 4]]); // duplicate → rejected
        $this->actingAs($user)->post('/lottery/tickets', ['numbers' => [1, 2, 3, 4, 99]]); // out of range → rejected

        $this->assertSame(4000, $user->fresh()->balance);
        $this->assertSame(1, LotteryTicket::count());
    }

    public function test_draw_is_deterministic_and_pays_winners(): void
    {
        config(['casino.lottery.ticket_price' => 1000, 'casino.lottery.seed_pool' => 100_000]);
        $service = app(LotteryService::class);
        $user = User::factory()->create(['balance' => 10_000]);

        $round = $service->current();
        $winning = LotteryService::drawNumbers($round->server_seed, $round->id);
        $this->assertSame(hash('sha256', $round->server_seed), $round->seed_hash);

        $service->buy($user, $winning); // jackpot ticket
        $round->forceFill(['draws_at' => now()->subSecond()])->save();

        $next = $service->current(); // draws the overdue round and opens the next one
        $round->refresh();

        $this->assertSame('drawn', $round->status);
        $this->assertSame($winning, $round->numbers);
        $this->assertNotSame($round->id, $next->id);
        $ticket = LotteryTicket::first();
        $this->assertSame(5, $ticket->matches);
        $this->assertSame((int) floor($round->pool * 0.5), $ticket->prize);
        $this->assertSame(10_000 - 1000 + $ticket->prize, $user->fresh()->balance);
        // Unwon tiers roll into the next pool.
        $this->assertSame(100_000 + $round->carried_over, $next->pool);
        $this->assertGreaterThan(0, LotteryRound::where('status', 'drawn')->count());
    }
}
