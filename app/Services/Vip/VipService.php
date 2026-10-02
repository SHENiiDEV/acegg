<?php

namespace App\Services\Vip;

use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\SpinKit\SpinKitClient;
use App\Services\SpinKit\SpinKitException;
use App\Services\Wallet\BonusService;
use App\Services\Wallet\WalletService;
use Carbon\CarbonImmutable;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class VipService
{
    public function __construct(
        private readonly SpinKitClient $spinKit,
        private readonly WalletService $wallet,
        private readonly BonusService $bonuses,
    ) {}

    // ------------------------------------------------------------ levels

    /** @return array<int, array<string, mixed>> */
    public function levels(): array
    {
        return config('casino.vip.levels');
    }

    public function levelIndex(int $xp): int
    {
        $index = 0;
        foreach ($this->levels() as $i => $level) {
            if ($xp >= $level['xp']) {
                $index = $i;
            }
        }

        return $index;
    }

    // ------------------------------------------------------------ sync from SpinKit

    /**
     * Pull new rounds for this player from SpinKit and add them to daily stats + XP.
     */
    public function sync(User $user): void
    {
        $since = $user->vip_synced_until; // "Y-m-d H:i:s" (UTC, SpinKit format)
        $query = ['external_id' => $user->spinKitPlayerId(), 'limit' => 500];
        if ($since) {
            $query['from'] = substr($since, 0, 10);
        }

        $byDay = [];
        $latest = $since;

        for ($page = 0; $page < 20; $page++) {
            try {
                $rows = $this->spinKit->get('/api/v2/rounds', $query + ['offset' => $page * 500])['rounds'] ?? [];
            } catch (SpinKitException $e) {
                if ($e->status === 404) {
                    return; // player not created yet
                }
                throw $e;
            }

            foreach ($rows as $r) {
                $at = (string) ($r['created_at'] ?? '');
                if ($since && $at <= $since) {
                    continue;
                }
                $day = substr($at, 0, 10);
                $byDay[$day]['wagered'] = ($byDay[$day]['wagered'] ?? 0) + (int) ($r['bet'] ?? 0);
                $byDay[$day]['won'] = ($byDay[$day]['won'] ?? 0) + (int) ($r['win'] ?? 0);
                $byDay[$day]['rounds'] = ($byDay[$day]['rounds'] ?? 0) + 1;
                if ($latest === null || $at > $latest) {
                    $latest = $at;
                }
            }

            if (count($rows) < 500) {
                break;
            }
        }

        if ($byDay === []) {
            return;
        }

        DB::transaction(function () use ($user, $byDay, $latest) {
            $wagered = 0;
            foreach ($byDay as $day => $s) {
                $row = DB::table('player_daily_stats')->where('user_id', $user->id)->where('date', $day)->first();
                if ($row) {
                    DB::table('player_daily_stats')->where('id', $row->id)->update([
                        'wagered' => $row->wagered + $s['wagered'],
                        'won' => $row->won + $s['won'],
                        'rounds' => $row->rounds + $s['rounds'],
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('player_daily_stats')->insert([
                        'user_id' => $user->id, 'date' => $day, ...$s, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
                $wagered += $s['wagered'];
            }

            $user->forceFill([
                'vip_xp' => $user->vip_xp + intdiv($wagered, 100),
                'vip_synced_until' => $latest,
            ])->save();
        });
    }

    // ------------------------------------------------------------ overview for the VIP page

    /** @return array<string, mixed> */
    public function overview(User $user): array
    {
        $levels = $this->levels();
        $current = $this->levelIndex($user->vip_xp);
        $next = $levels[$current + 1] ?? null;
        $claimed = DB::table('reward_claims')->where('user_id', $user->id)->pluck('key')->flip();

        return [
            'xp' => $user->vip_xp,
            'level' => $current,
            'levels' => array_map(fn ($l, $i) => [
                ...$l,
                'index' => $i,
                'reached' => $i <= $current,
                'reward_claimed' => $l['reward'] === 0 || $claimed->has("level:{$i}"),
            ], $levels, array_keys($levels)),
            'next_xp' => $next['xp'] ?? null,
            'missions' => $this->missions($user, $claimed->all()),
            'cashback' => $this->cashbackInfo($user),
            'today' => $this->statsForDay($user, $this->today()),
        ];
    }

    /**
     * @param  array<string, int>  $claimed
     * @return array<int, array<string, mixed>>
     */
    private function missions(User $user, array $claimed): array
    {
        $cfg = config('casino.vip.missions');
        $today = $this->today();
        $week = $today->startOfWeek();
        $wageredToday = $this->statsForDay($user, $today)['wagered'];
        $activeDays = DB::table('player_daily_stats')->where('user_id', $user->id)
            ->where('date', '>=', $week->toDateString())->where('rounds', '>', 0)->count();
        $cashback = $this->cashbackInfo($user);

        return [
            [
                'key' => 'daily_wager',
                'title' => 'Complete Daily Wager',
                'text' => 'Wager '.number_format($cfg['daily_wager']['target'] / 100).' coins today to earn a reward',
                'progress' => min($wageredToday, $cfg['daily_wager']['target']),
                'target' => $cfg['daily_wager']['target'],
                'reward' => $cfg['daily_wager']['reward'],
                'claimed' => isset($claimed['mission:daily_wager:'.$today->toDateString()]),
                'action' => 'claim',
            ],
            [
                'key' => 'daily_bonus',
                'title' => 'Collect Free Coins',
                'text' => 'Claim your daily free coins from the Wallet',
                'progress' => $this->bonuses->canClaimDaily($user) ? 0 : 1,
                'target' => 1,
                'reward' => (int) config('casino.daily_bonus'),
                'claimed' => ! $this->bonuses->canClaimDaily($user),
                'action' => 'daily',
            ],
            [
                'key' => 'cashback',
                'title' => 'Claim Your VIP Cashback',
                'text' => "Get {$cashback['rate']}% of your net losses back every week",
                'progress' => $cashback['available'] ? 1 : 0,
                'target' => 1,
                'reward' => $cashback['amount'],
                'claimed' => ! $cashback['available'] && $cashback['next_at'] !== null,
                'action' => 'cashback',
            ],
            [
                'key' => 'weekly_activity',
                'title' => 'Maintain VIP Activity',
                'text' => "Play on {$cfg['weekly_activity']['target']} different days this week",
                'progress' => min($activeDays, $cfg['weekly_activity']['target']),
                'target' => $cfg['weekly_activity']['target'],
                'reward' => $cfg['weekly_activity']['reward'],
                'claimed' => isset($claimed['mission:weekly_activity:'.$week->toDateString()]),
                'action' => 'claim',
            ],
        ];
    }

    /** @return array{wagered: int, won: int, rounds: int} */
    private function statsForDay(User $user, CarbonImmutable $day): array
    {
        $row = DB::table('player_daily_stats')->where('user_id', $user->id)->where('date', $day->toDateString())->first();

        return ['wagered' => (int) ($row->wagered ?? 0), 'won' => (int) ($row->won ?? 0), 'rounds' => (int) ($row->rounds ?? 0)];
    }

    /** @return array{rate: int, amount: int, available: bool, next_at: string|null, net_loss: int} */
    public function cashbackInfo(User $user): array
    {
        $rate = (int) $this->levels()[$this->levelIndex($user->vip_xp)]['cashback'];
        $period = (int) config('casino.vip.cashback_period_days');
        $from = $user->cashback_claimed_at ?? $user->created_at ?? now()->subDays($period);

        // game_in is negative (coins sent to games), game_out positive (coins back).
        $net = (int) WalletTransaction::where('user_id', $user->id)
            ->whereIn('type', [WalletTransaction::GAME_IN, WalletTransaction::GAME_OUT])
            ->where('created_at', '>', $from)
            ->sum('amount');
        $loss = max(0, -$net);
        $amount = intdiv($loss * $rate, 100);

        $nextAt = $user->cashback_claimed_at?->addDays($period);
        $periodOver = $nextAt === null || $nextAt->isPast();

        return [
            'rate' => $rate,
            'amount' => $amount,
            'net_loss' => $loss,
            'available' => $periodOver && $amount > 0,
            'next_at' => $periodOver ? null : $nextAt->toIso8601String(),
        ];
    }

    // ------------------------------------------------------------ claims

    public function claimMission(User $user, string $mission): int
    {
        $cfg = config("casino.vip.missions.{$mission}") ?? throw new RuntimeException('Unknown mission.');
        $today = $this->today();

        if ($mission === 'daily_wager') {
            if ($this->statsForDay($user, $today)['wagered'] < $cfg['target']) {
                throw new RuntimeException('Mission is not completed yet.');
            }
            $key = 'mission:daily_wager:'.$today->toDateString();
        } else {
            $week = $today->startOfWeek();
            $days = DB::table('player_daily_stats')->where('user_id', $user->id)
                ->where('date', '>=', $week->toDateString())->where('rounds', '>', 0)->count();
            if ($days < $cfg['target']) {
                throw new RuntimeException('Mission is not completed yet.');
            }
            $key = 'mission:weekly_activity:'.$week->toDateString();
        }

        return $this->pay($user, $key, $cfg['reward'], WalletTransaction::VIP_REWARD);
    }

    public function claimLevelReward(User $user, int $index): int
    {
        $level = $this->levels()[$index] ?? throw new RuntimeException('Unknown level.');
        if ($index > $this->levelIndex($user->vip_xp) || $level['reward'] <= 0) {
            throw new RuntimeException('Level not reached yet.');
        }

        return $this->pay($user, "level:{$index}", $level['reward'], WalletTransaction::VIP_REWARD);
    }

    public function claimCashback(User $user): int
    {
        $info = $this->cashbackInfo($user);
        if (! $info['available']) {
            throw new RuntimeException('No cashback available right now.');
        }

        $amount = $this->pay($user, 'cashback:'.now()->format('YmdHis'), $info['amount'], WalletTransaction::CASHBACK);
        $user->forceFill(['cashback_claimed_at' => now()])->save();

        return $amount;
    }

    private function pay(User $user, string $key, int $amount, string $type): int
    {
        try {
            DB::transaction(function () use ($user, $key, $amount, $type) {
                DB::table('reward_claims')->insert(['user_id' => $user->id, 'key' => $key, 'amount' => $amount, 'created_at' => now(), 'updated_at' => now()]);
                $this->wallet->credit($user, $amount, $type, "{$key}:{$user->id}");
            });
        } catch (UniqueConstraintViolationException) {
            throw new RuntimeException('Reward already claimed.');
        }

        return $amount;
    }

    private function today(): CarbonImmutable
    {
        return CarbonImmutable::now('UTC')->startOfDay();
    }
}
