<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\SpinKit\SpinKitClient;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GameWalletTest extends TestCase
{
    use RefreshDatabase;

    private const URL = 'http://spinkit.test';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.spinkit.url' => self::URL,
            'services.spinkit.token' => 'sk_test',
            'casino.welcome_bonus' => 500_000,
            'casino.player_prefix' => 'acegg-',
        ]);
        $this->app->forgetInstance(SpinKitClient::class);
    }

    /** @param  array<string, mixed>  $overrides */
    private function fakeSpinKit(int &$spinKitBalance, array $overrides = []): void
    {
        $game = ['game_id' => 'olympus_thunder', 'name' => 'Olympus Thunder', 'category' => 'mythology', 'mechanic' => 'tumble', 'features' => [], 'theme' => []];

        Http::fake(function (Request $request) use (&$spinKitBalance, $game, $overrides) {
            $path = parse_url($request->url(), PHP_URL_PATH);
            $method = $request->method();

            return match (true) {
                $path === '/api/v2/merchant' => Http::response(['merchant' => ['demo_refill' => $overrides['demo_refill'] ?? false]]),
                $path === '/api/v2/games' => Http::response(['games' => [$game]]),
                $path === '/api/v2/players' => Http::response(['created' => true, 'player' => ['balance' => $spinKitBalance]]),
                $path === '/api/v2/players/acegg-1' => Http::response(['player' => ['balance' => $spinKitBalance]]),
                str_ends_with($path, '/deposit') => (function () use (&$spinKitBalance, $request) {
                    $spinKitBalance += $request['amount'];

                    return Http::response(['balance' => $spinKitBalance]);
                })(),
                str_ends_with($path, '/withdraw') => (function () use (&$spinKitBalance, $request) {
                    $spinKitBalance -= $request['amount'];

                    return Http::response(['balance' => $spinKitBalance]);
                })(),
                $path === '/api/v2/sessions' => Http::response(['session' => ['token' => 'tok-1', 'launch_url' => self::URL.'/games/olympus_thunder/?token=tok-1']]),
                $method === 'DELETE' => Http::response(['revoked' => true]),
                default => Http::response(['status' => 'error', 'error' => 'NOT_FOUND', 'message' => $path], 404),
            };
        });
    }

    public function test_registration_grants_welcome_bonus(): void
    {
        $user = User::factory()->create();
        event(new Registered($user));

        $this->assertSame(500_000, $user->fresh()->balance);
        $this->assertDatabaseHas('wallet_transactions', ['user_id' => $user->id, 'type' => WalletTransaction::WELCOME_BONUS]);
    }

    public function test_launch_moves_coins_into_spinkit_and_lobby_brings_them_back(): void
    {
        $spinKit = 0;
        $this->fakeSpinKit($spinKit);
        $user = User::factory()->create(['balance' => 100_000]);

        $this->actingAs($user)->get('/play/olympus_thunder')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('casino/play')->where('launchUrl', self::URL.'/games/olympus_thunder/?token=tok-1'));

        $this->assertSame(0, $user->fresh()->balance);
        $this->assertSame(100_000, $spinKit);
        $this->assertSame('tok-1', $user->fresh()->game_session_token);

        // Background polling while the game is open must NOT close the session (regression: 401 on /rgs/spin).
        $this->getJson('/notifications')->assertOk();
        $this->getJson('/wallet/balance')->assertOk();
        $this->assertSame('tok-1', $user->fresh()->game_session_token);

        // Player wins 2,500 coins in the game, then returns to the lobby.
        $spinKit += 250_000;
        $this->get('/')->assertOk();

        $this->assertSame(350_000, $user->fresh()->balance);
        $this->assertSame(0, $spinKit);
        $this->assertNull($user->fresh()->game_session_token);
    }

    public function test_launch_is_refused_when_merchant_has_demo_refill(): void
    {
        $spinKit = 0;
        $this->fakeSpinKit($spinKit, ['demo_refill' => true]);
        $user = User::factory()->create(['balance' => 100_000]);

        $this->actingAs($user)->get('/play/olympus_thunder')->assertRedirect('/');

        $this->assertSame(100_000, $user->fresh()->balance);
        $this->assertSame(0, $spinKit);
    }

    public function test_guests_must_log_in_to_play(): void
    {
        $this->get('/play/olympus_thunder')->assertRedirect('/login');
    }

    public function test_daily_bonus_can_be_claimed_once_per_day(): void
    {
        config(['casino.daily_bonus' => 100_000]);
        $user = User::factory()->create(['balance' => 0]);

        $this->actingAs($user)->post('/bonus/daily');
        $this->actingAs($user)->post('/bonus/daily');

        $this->assertSame(100_000, $user->fresh()->balance);
    }

    public function test_wallet_history_page_lists_transactions(): void
    {
        $user = User::factory()->create();
        event(new Registered($user));

        $this->actingAs($user)->get('/settings/wallet')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('settings/wallet')->has('transactions.data', 1));
    }

    public function test_unknown_pages_render_the_branded_404(): void
    {
        $this->get('/definitely-not-here')
            ->assertNotFound()
            ->assertInertia(fn ($page) => $page->component('errors/error')->where('status', 404));
    }
}
