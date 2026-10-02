<?php

namespace App\Services\Lottery;

use App\Models\LotteryRound;
use App\Models\LotteryTicket;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Notifications\LotteryWon;
use App\Services\Wallet\WalletService;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

/**
 * Hourly lottery. Pick `pick` numbers out of 1..max_number.
 *
 * Provably fair: when a round opens we publish sha256(server_seed). After the
 * draw the seed is revealed and anyone can recompute the numbers with
 * drawNumbers(seed, roundId).
 */
class LotteryService
{
    public function __construct(private readonly WalletService $wallet) {}

    /** @return array<string, mixed> */
    public function config(): array
    {
        return config('casino.lottery');
    }

    /**
     * Draw every overdue round, then return the open one (creating it if needed).
     */
    public function current(): LotteryRound
    {
        LotteryRound::where('status', 'open')->where('draws_at', '<=', now())->orderBy('id')
            ->each(fn (LotteryRound $r) => $this->draw($r));

        return DB::transaction(function () {
            $open = LotteryRound::where('status', 'open')->lockForUpdate()->latest('id')->first();
            if ($open) {
                return $open;
            }

            $carry = (int) (LotteryRound::where('status', 'drawn')->latest('id')->value('carried_over') ?? 0);
            $seed = bin2hex(random_bytes(32));

            return LotteryRound::create([
                'draws_at' => now()->addHour()->startOfHour(),
                'status' => 'open',
                'server_seed' => $seed,
                'seed_hash' => hash('sha256', $seed),
                'pool' => (int) $this->config()['seed_pool'] + $carry,
                'carried_over' => 0,
                'paid_out' => 0,
                'tickets_count' => 0,
            ])->refresh();
        });
    }

    /**
     * @param  array<int, int|string>  $numbers
     */
    public function buy(User $user, array $numbers): LotteryTicket
    {
        $cfg = $this->config();
        $numbers = array_values(array_unique(array_map('intval', $numbers)));
        sort($numbers);

        if (count($numbers) !== $cfg['pick']) {
            throw new InvalidArgumentException("Pick exactly {$cfg['pick']} different numbers.");
        }
        foreach ($numbers as $n) {
            if ($n < 1 || $n > $cfg['max_number']) {
                throw new InvalidArgumentException("Numbers must be between 1 and {$cfg['max_number']}.");
            }
        }

        $round = $this->current();

        return DB::transaction(function () use ($user, $numbers, $round, $cfg) {
            /** @var LotteryRound $round */
            $round = LotteryRound::whereKey($round->id)->lockForUpdate()->firstOrFail();
            if (! $round->isOpen() || $round->draws_at->isPast()) {
                throw new RuntimeException('This draw is closed. Try the next one.');
            }

            $mine = LotteryTicket::where('lottery_round_id', $round->id)->where('user_id', $user->id)->count();
            if ($mine >= $cfg['max_tickets_per_round']) {
                throw new RuntimeException("Maximum {$cfg['max_tickets_per_round']} tickets per draw.");
            }

            $ticket = LotteryTicket::create([
                'lottery_round_id' => $round->id,
                'user_id' => $user->id,
                'numbers' => $numbers,
            ]);

            // Throws InvalidArgumentException on insufficient balance → rolls back the ticket.
            $this->wallet->debit($user, $cfg['ticket_price'], WalletTransaction::LOTTERY_TICKET, 'lottery-ticket-'.$ticket->id);

            $round->increment('tickets_count');
            $round->increment('pool', (int) floor($cfg['ticket_price'] * $cfg['pool_share']));

            return $ticket;
        });
    }

    public function draw(LotteryRound $round): void
    {
        DB::transaction(function () use ($round) {
            /** @var LotteryRound $round */
            $round = LotteryRound::whereKey($round->id)->lockForUpdate()->firstOrFail();
            if (! $round->isOpen()) {
                return;
            }

            $cfg = $this->config();
            $numbers = self::drawNumbers($round->server_seed, $round->id, $cfg['pick'], $cfg['max_number']);
            $tickets = $round->tickets()->get();

            foreach ($tickets as $t) {
                $t->matches = count(array_intersect($t->numbers, $numbers));
            }

            $paid = 0;
            $unwon = 0;
            foreach ($cfg['tiers'] as $matches => $share) {
                $tierPool = (int) floor($round->pool * $share);
                $winners = $tickets->where('matches', $matches);
                if ($winners->isEmpty()) {
                    $unwon += $tierPool;

                    continue;
                }
                $each = intdiv($tierPool, $winners->count());
                $winners->each(fn ($t) => $t->prize = $each);
                $paid += $each * $winners->count();
            }
            foreach ($cfg['fixed'] as $matches => $amount) {
                $tickets->where('matches', $matches)->each(function ($t) use ($amount, &$paid) {
                    $t->prize = $amount;
                    $paid += $amount;
                });
            }

            foreach ($tickets as $t) {
                $t->save();
                if ($t->prize > 0) {
                    $this->wallet->credit($t->user, $t->prize, WalletTransaction::LOTTERY_WIN, 'lottery-win-'.$t->id);
                    $t->user->notify(new LotteryWon($t)); // sent after the transaction commits
                }
            }

            // Unwon tier money rolls into the next draw (on top of its house seed).
            $round->forceFill([
                'status' => 'drawn',
                'numbers' => $numbers,
                'paid_out' => $paid,
                'carried_over' => $unwon,
                'drawn_at' => now(),
            ])->save();
        });
    }

    /**
     * Deterministic, verifiable draw: HMAC-SHA256(seed, "round:{id}:{i}") → unique numbers.
     *
     * @return array<int, int>
     */
    public static function drawNumbers(string $seed, int $roundId, int $pick = 5, int $max = 36): array
    {
        $out = [];
        for ($i = 0; count($out) < $pick; $i++) {
            $n = (hexdec(substr(hash_hmac('sha256', "round:{$roundId}:{$i}", $seed), 0, 8)) % $max) + 1;
            if (! in_array($n, $out, true)) {
                $out[] = $n;
            }
        }
        sort($out);

        return $out;
    }
}
