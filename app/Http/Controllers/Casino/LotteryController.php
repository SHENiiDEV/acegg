<?php

namespace App\Http\Controllers\Casino;

use App\Http\Controllers\Controller;
use App\Models\LotteryRound;
use App\Models\LotteryTicket;
use App\Services\Lottery\LotteryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use RuntimeException;

class LotteryController extends Controller
{
    public function __construct(private readonly LotteryService $lottery) {}

    public function show(Request $request): Response
    {
        $round = $this->lottery->current();
        $user = $request->user();
        $cfg = $this->lottery->config();

        $lastDrawn = LotteryRound::where('status', 'drawn')->latest('id')->first();

        return Inertia::render('casino/lottery', [
            'config' => [
                'ticket_price' => $cfg['ticket_price'],
                'pick' => $cfg['pick'],
                'max_number' => $cfg['max_number'],
                'max_tickets' => $cfg['max_tickets_per_round'],
                'tiers' => collect($cfg['tiers'])->map(fn ($share, $m) => ['matches' => $m, 'share' => $share])->values(),
                'fixed' => collect($cfg['fixed'])->map(fn ($amount, $m) => ['matches' => $m, 'amount' => $amount])->values(),
            ],
            'round' => $this->presentRound($round),
            'myTickets' => $user ? LotteryTicket::where('lottery_round_id', $round->id)->where('user_id', $user->id)
                ->latest('id')->get(['id', 'numbers', 'created_at']) : [],
            'lastDraw' => $lastDrawn ? [
                ...$this->presentRound($lastDrawn),
                'server_seed' => $lastDrawn->server_seed,
                'my_tickets' => $user ? LotteryTicket::where('lottery_round_id', $lastDrawn->id)->where('user_id', $user->id)
                    ->get(['id', 'numbers', 'matches', 'prize']) : [],
            ] : null,
            'history' => LotteryRound::where('status', 'drawn')->latest('id')->limit(8)->get()
                ->map(fn ($r) => $this->presentRound($r) + ['server_seed' => $r->server_seed]),
            'winners' => $this->recentWinners(),
            'topWinners' => $this->topWinners(),
        ]);
    }

    public function buy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'numbers' => ['required', 'array'],
            'numbers.*' => ['integer'],
        ]);

        try {
            $this->lottery->buy($request->user(), $data['numbers']);
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Ticket purchased — good luck!']);
        } catch (InvalidArgumentException|RuntimeException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage() === 'Insufficient balance.' ? 'Not enough coins for a ticket.' : $e->getMessage()]);
        }

        return back();
    }

    /** @return array<string, mixed> */
    private function presentRound(LotteryRound $r): array
    {
        return [
            'id' => $r->id,
            'status' => $r->status,
            'draws_at' => $r->draws_at->toIso8601String(),
            'pool' => (int) $r->pool,
            'paid_out' => (int) $r->paid_out,
            'tickets_count' => (int) $r->tickets_count,
            'numbers' => $r->numbers,
            'seed_hash' => $r->seed_hash,
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function recentWinners(): array
    {
        return LotteryTicket::with(['user:id,name', 'round:id,numbers,drawn_at'])
            ->where('prize', '>', 0)->latest('id')->limit(8)->get()
            ->map(fn (LotteryTicket $t) => [
                'id' => $t->id,
                'player' => self::mask($t->user?->name ?? 'Player'),
                'numbers' => $t->numbers,
                'drawn' => $t->round?->numbers ?? [],
                'matches' => $t->matches,
                'prize' => $t->prize,
                'round_id' => $t->lottery_round_id,
                'at' => $t->round?->drawn_at?->toIso8601String(),
            ])->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function topWinners(): array
    {
        return LotteryTicket::query()
            ->select('user_id', DB::raw('SUM(prize) as total'), DB::raw('MAX(lottery_round_id) as round_id'))
            ->where('prize', '>', 0)->where('created_at', '>=', now()->subWeek())
            ->groupBy('user_id')->orderByDesc('total')->limit(6)->with('user:id,name')->get()
            ->map(fn ($row) => ['player' => self::mask($row->user?->name ?? 'Player'), 'total' => (int) $row->total, 'round_id' => (int) $row->round_id])
            ->all();
    }

    private static function mask(string $name): string
    {
        return mb_strlen($name) <= 3 ? $name.'***' : mb_substr($name, 0, 3).'***';
    }
}
