<?php

namespace Tests\Feature;

use App\Models\LotteryTicket;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\LotteryWon;
use App\Notifications\TopupCompleted;
use App\Payments\PaymentService;
use App\Services\Lottery\LotteryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class TopupTest extends TestCase
{
    use RefreshDatabase;

    public function test_topup_page_renders(): void
    {
        $this->get('/topup')->assertOk();
        $this->actingAs(User::factory()->create())->get('/topup')->assertOk();
    }

    public function test_buying_a_package_redirects_to_checkout_and_credits_coins_once(): void
    {
        Notification::fake();
        $user = User::factory()->create(['balance' => 0]);

        $this->actingAs($user)->post('/topup', ['package' => 'popular', 'currency' => 'EUR'])->assertRedirect();
        $payment = Payment::firstOrFail();
        $this->assertSame('pending', $payment->status);
        $this->assertSame('EUR', $payment->currency);
        $this->assertSame(2500, $payment->amount);

        $url = URL::temporarySignedRoute('topup.sandbox', now()->addMinutes(5), ['payment' => $payment->id]);
        $this->actingAs($user)->post($url, ['decision' => 'approve'])->assertRedirect('/topup/'.$payment->id);
        $this->actingAs($user)->post($url, ['decision' => 'approve']); // repeat → no double credit

        $expected = 2500 * 10_000 + intdiv(2500 * 10_000 * 20, 100);
        $this->assertSame($expected, $user->fresh()->balance);
        $this->assertSame('paid', $payment->fresh()->status);
        Notification::assertSentToTimes($user, TopupCompleted::class, 1);
    }

    public function test_buying_a_package_with_gbp(): void
    {
        Notification::fake();
        $user = User::factory()->create(['balance' => 0]);

        $this->actingAs($user)->post('/topup', ['package' => 'popular', 'currency' => 'GBP'])->assertRedirect();
        $payment = Payment::firstOrFail();
        $this->assertSame('GBP', $payment->currency);
        $this->assertSame(2250, $payment->amount);

        $url = URL::temporarySignedRoute('topup.sandbox', now()->addMinutes(5), ['payment' => $payment->id]);
        $this->actingAs($user)->post($url, ['decision' => 'approve'])->assertRedirect('/topup/'.$payment->id);

        $expected = 2250 * 12_000 + intdiv(2250 * 12_000 * 20, 100);
        $this->assertSame($expected, $user->fresh()->balance);
    }

    public function test_custom_amount_limits_and_profile_requirement(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post('/topup', ['amount' => 1, 'currency' => 'EUR']);          // below €5
        $this->actingAs($user)->post('/topup', ['amount' => 5000, 'currency' => 'EUR']);       // above €1,000
        $this->assertSame(0, Payment::count());

        $this->actingAs($user)->post('/topup', ['amount' => 12.5, 'currency' => 'EUR']);
        $this->assertSame(1250, Payment::firstOrFail()->amount);

        $incomplete = User::factory()->create(['address_line' => null]);
        $this->actingAs($incomplete)->post('/topup', ['package' => 'basic'])->assertRedirect('/settings/profile');
        $this->assertSame(1, Payment::count());
    }

    public function test_sandbox_link_requires_signature(): void
    {
        $user = User::factory()->create();
        $payment = app(PaymentService::class)->create($user, 'starter', null);
        $this->actingAs($user)->post('/topup/'.$payment->id.'/sandbox', ['decision' => 'approve'])->assertForbidden();
        $this->assertSame('pending', $payment->fresh()->status);
    }

    public function test_notifications_endpoint_and_lottery_win_notification(): void
    {
        config(['casino.lottery.ticket_price' => 1000, 'casino.lottery.seed_pool' => 100_000]);
        $user = User::factory()->create(['balance' => 10_000]);
        $lottery = app(LotteryService::class);
        $round = $lottery->current();
        $lottery->buy($user, LotteryService::drawNumbers($round->server_seed, $round->id));
        $round->forceFill(['draws_at' => now()->subSecond()])->save();
        $lottery->current();

        $this->assertGreaterThan(0, LotteryTicket::first()->prize);
        $this->actingAs($user)->getJson('/notifications')
            ->assertOk()
            ->assertJsonPath('unread', 1)
            ->assertJsonPath('items.0.kind', 'lottery_win');

        $this->actingAs($user)->postJson('/notifications/read')->assertJsonPath('unread', 0);
        $this->assertSame(0, $user->unreadNotifications()->count());
    }
}
