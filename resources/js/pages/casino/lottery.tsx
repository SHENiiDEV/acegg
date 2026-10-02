import { Head, Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, Clock, Crown, Gift, Shuffle, Star, Ticket, Trash2, Tv } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CoinIcon } from '@/components/casino/art';
import { IconBadge } from '@/components/casino/icon-badge';
import { PageTitle } from '@/components/casino/page-title';
import { useNow } from '@/hooks/use-now';
import { formatCoins, formatCoinsShort } from '@/lib/casino';
import { cn } from '@/lib/utils';

type Round = {
    id: number;
    status: 'open' | 'drawn';
    draws_at: string;
    pool: number;
    paid_out: number;
    tickets_count: number;
    numbers: number[] | null;
    seed_hash: string;
    server_seed?: string;
};
type MyTicket = { id: number; numbers: number[]; matches?: number | null; prize?: number };
type Winner = { id: number; player: string; numbers: number[]; drawn: number[]; matches: number; prize: number; round_id: number; at: string | null };

type Props = {
    config: {
        ticket_price: number;
        pick: number;
        max_number: number;
        max_tickets: number;
        tiers: { matches: number; share: number }[];
        fixed: { matches: number; amount: number }[];
    };
    round: Round;
    myTickets: MyTicket[];
    lastDraw: (Round & { my_tickets: MyTicket[] }) | null;
    history: Round[];
    winners: Winner[];
    topWinners: { player: string; total: number; round_id: number }[];
};

export default function Lottery({ config, round, myTickets, lastDraw, history, winners, topWinners }: Props) {
    const { auth, wallet } = usePage().props;
    const now = useNow();
    const left = now === null ? null : Math.max(0, new Date(round.draws_at).getTime() - now);
    const [picked, setPicked] = useState<number[]>([]);
    const due = left === 0;

    // When the countdown hits zero, reload: the server draws the round and opens the next one.
    useEffect(() => {
        if (!due) return;
        const t = setTimeout(() => router.reload(), 2000);
        return () => clearTimeout(t);
    }, [due, round.id]);

    const toggle = (n: number) =>
        setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < config.pick ? [...p, n].sort((a, b) => a - b) : p));
    const quickPick = () => {
        const set = new Set<number>();
        while (set.size < config.pick) set.add(1 + Math.floor(Math.random() * config.max_number));
        setPicked([...set].sort((a, b) => a - b));
    };
    const canAfford = (wallet?.balance ?? 0) >= config.ticket_price;
    const buy = () =>
        router.post('/lottery/tickets', { numbers: picked }, { preserveScroll: true, onSuccess: () => setPicked([]) });

    const l = left ?? 0;
    const h = Math.floor(l / 3_600_000);
    const m = Math.floor((l % 3_600_000) / 60_000);
    const s = Math.floor((l % 60_000) / 1000);
    const pad = (v: number) => (left === null ? '--' : String(v).padStart(2, '0'));
    const lastNumbers = lastDraw?.numbers ?? [];

    return (
        <>
            <Head title="Lottery" />
            <PageTitle icon={Ticket} title="Lottery" />

            {/* Top cards */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <TopCard live label="live now" title="Hourly Draw" value={formatCoinsShort(round.pool)} icon={Ticket} tone="lime" highlight />
                <TopCard label={`Draw in ${pad(m)}:${pad(s)}`} title="Round" value={`#${round.id}`} icon={Clock} tone="sky" />
                <TopCard label="This round" title="Tickets sold" value={(round.tickets_count ?? 0).toLocaleString('en-US')} icon={Star} tone="amber" />
                <TopCard
                    label="Ended"
                    title={lastDraw ? `Round #${lastDraw.id}` : 'No draws yet'}
                    value={lastDraw ? `${formatCoinsShort(lastDraw.paid_out)} paid` : '—'}
                    icon={Gift}
                    tone="rose"
                />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
                {/* Main draw card */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b2029] via-[#2b4a14] to-[#7ccf1f] p-5 ring-1 ring-line/60 md:p-7">
                    <div className="bg-suits absolute inset-0 opacity-60" />
                    <IconBadge icon={Ticket} tone="lime" className="absolute right-8 bottom-16 hidden size-36 rotate-12 rounded-[40px] md:flex" iconClassName="size-20" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                                <span className="size-2 animate-pulse rounded-full bg-lime" /> Drawing every hour
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="hidden font-semibold text-white/80 sm:inline">Round #{round.id}</span>
                                <a href="#fair" className="flex items-center gap-1 rounded-lg bg-lime px-2.5 py-1 font-bold text-lime-ink">
                                    <BadgeCheck className="size-3.5" /> Provably fair
                                </a>
                            </div>
                        </div>
                        <div className="mt-5 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">Current prize pool</div>
                        <div className="mt-1 flex items-center gap-3 text-[40px] leading-none font-extrabold tracking-tight tabular-nums md:text-6xl">
                            <CoinIcon className="size-10 md:size-12" />
                            {formatCoins(round.pool, 0)}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-xs text-white/60">Last draw:</span>
                            {(lastNumbers.length ? lastNumbers : Array(config.pick).fill(0)).map((n: number, i: number) => (
                                <Ball key={i} n={n} active={n > 0} size="lg" />
                            ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                            <div className="flex gap-2">
                                {[
                                    [h, 'H'],
                                    [m, 'M'],
                                    [s, 'S'],
                                ].map(([v, u]) => (
                                    <span key={u} className="rounded-xl bg-black/35 px-2.5 py-2 text-xl font-extrabold tabular-nums backdrop-blur sm:px-3 sm:text-2xl">
                                        {pad(v as number)}
                                        <span className="ml-1 text-xs font-semibold text-white/60">{u}</span>
                                    </span>
                                ))}
                            </div>
                            <a href="#pick" className="rounded-xl bg-lime px-6 py-3 text-sm font-bold text-lime-ink shadow-lg">
                                Buy Tickets
                            </a>
                        </div>
                        <div className="mt-5 flex justify-between text-xs text-white/70">
                            <span>Ticket price</span>
                            <span className="font-semibold text-white">{formatCoins(config.ticket_price, 0)} coins</span>
                        </div>
                    </div>
                </section>

                {/* Top winners */}
                <section className="rounded-2xl bg-surface p-4 ring-1 ring-line/60">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <Star className="size-4 text-lime" /> Top winners this week
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                        {topWinners.length === 0 && <p className="rounded-xl bg-surface-2/60 p-6 text-center text-sm text-dim">No winners yet — be the first!</p>}
                        {topWinners.map((w, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-xl bg-surface-2/60 p-2.5">
                                <span
                                    className={cn(
                                        'flex size-8 items-center justify-center rounded-lg text-sm font-bold',
                                        i === 0 ? 'bg-amber-400 text-black' : i === 1 ? 'bg-slate-300 text-black' : i === 2 ? 'bg-orange-400 text-black' : 'bg-page text-dim',
                                    )}
                                >
                                    {i + 1}
                                </span>
                                <span className="flex-1 text-sm font-semibold">{w.player}</span>
                                <span className="text-right leading-tight">
                                    <span className="block text-sm font-bold tabular-nums">{formatCoinsShort(w.total)}</span>
                                    <span className="text-[11px] text-dim">Round #{w.round_id}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* How to play */}
            <section className="mt-8">
                <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
                    <Crown className="size-4 text-lime" /> How to play
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {[
                        { icon: Ticket, tone: 'lime' as const, t: 'Buy a ticket', d: `Pick ${config.pick} numbers or use Quick Pick.` },
                        { icon: Tv, tone: 'violet' as const, t: 'Watch the draw', d: 'Balls are drawn at the top of every hour.' },
                        { icon: Gift, tone: 'amber' as const, t: 'Get paid', d: 'Winnings hit your balance instantly.' },
                    ].map((x) => (
                        <div key={x.t} className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line/60">
                            <IconBadge icon={x.icon} tone={x.tone} className="size-12 rounded-xl" iconClassName="size-6" />
                            <div>
                                <div className="font-semibold">{x.t}</div>
                                <div className="text-xs text-dim">{x.d}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Picker */}
            <section id="pick" className="mt-8 scroll-mt-24 grid gap-4 xl:grid-cols-[1fr_360px]">
                <div className="rounded-2xl bg-surface p-5 ring-1 ring-line/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <div className="font-semibold">Make your card</div>
                            <div className="text-xs text-dim">
                                Choose {config.pick} numbers from 1 to {config.max_number} · {picked.length}/{config.pick} selected
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={quickPick} className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold hover:bg-line">
                                <Shuffle className="size-3.5" /> Quick Pick
                            </button>
                            <button type="button" onClick={() => setPicked([])} className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold hover:bg-line">
                                <Trash2 className="size-3.5" /> Clear
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-9 lg:grid-cols-12">
                        {Array.from({ length: config.max_number }, (_, i) => i + 1).map((n) => {
                            const on = picked.includes(n);
                            const full = picked.length >= config.pick && !on;
                            return (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => toggle(n)}
                                    disabled={full}
                                    className={cn(
                                        'aspect-square rounded-full text-sm font-bold transition',
                                        on
                                            ? 'scale-105 bg-gradient-to-b from-[#e9ff8a] to-[#5fbf0a] text-[#173300] shadow-[0_6px_18px_-6px_rgba(140,220,20,.9)]'
                                            : 'bg-surface-2 text-white hover:bg-line disabled:opacity-35',
                                    )}
                                >
                                    {n}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2/60 p-3">
                        <div className="flex gap-1.5">
                            {Array.from({ length: config.pick }).map((_, i) => (
                                <Ball key={i} n={picked[i] ?? 0} active={picked[i] !== undefined} />
                            ))}
                        </div>
                        {auth.user ? (
                            <button
                                type="button"
                                onClick={buy}
                                disabled={picked.length !== config.pick || !canAfford || myTickets.length >= config.max_tickets}
                                className="flex items-center gap-2 rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink disabled:bg-line disabled:text-dim"
                            >
                                <CoinIcon className="size-4" />
                                {!canAfford
                                    ? 'Not enough coins'
                                    : myTickets.length >= config.max_tickets
                                      ? 'Ticket limit reached'
                                      : `Buy ticket · ${formatCoins(config.ticket_price, 0)}`}
                            </button>
                        ) : (
                            <Link href="/login" className="rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink">
                                Log in to play
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl bg-surface p-4 ring-1 ring-line/60">
                    <div className="flex items-center justify-between text-sm font-semibold">
                        <span className="flex items-center gap-1.5">
                            <Ticket className="size-4 text-lime" /> My tickets · #{round.id}
                        </span>
                        <span className="text-xs text-dim">
                            {myTickets.length}/{config.max_tickets}
                        </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                        {myTickets.length === 0 && <p className="rounded-xl bg-surface-2/60 p-6 text-center text-sm text-dim">No tickets for this draw yet.</p>}
                        {myTickets.map((t) => (
                            <div key={t.id} className="flex items-center justify-between rounded-xl bg-surface-2/60 p-2.5">
                                <span className="text-xs text-dim">#{t.id}</span>
                                <div className="flex gap-1">
                                    {t.numbers.map((n) => (
                                        <Ball key={n} n={n} active size="sm" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {lastDraw && lastDraw.my_tickets.length > 0 && (
                        <>
                            <div className="mt-5 text-sm font-semibold">Results · #{lastDraw.id}</div>
                            <div className="mt-2 flex flex-col gap-2">
                                {lastDraw.my_tickets.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2/60 p-2.5">
                                        <div className="flex gap-1">
                                            {t.numbers.map((n) => (
                                                <Ball key={n} n={n} active={lastNumbers.includes(n)} size="sm" />
                                            ))}
                                        </div>
                                        <span className={cn('text-xs font-bold', (t.prize ?? 0) > 0 ? 'text-lime' : 'text-dim')}>
                                            {(t.prize ?? 0) > 0 ? `+${formatCoinsShort(t.prize ?? 0)}` : `${t.matches}/${config.pick}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Live winners */}
            <section className="mt-8">
                <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
                    <Crown className="size-4 text-lime" /> Live winners
                </div>
                <div className="overflow-x-auto rounded-2xl ring-1 ring-line/60">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-surface text-left text-[11px] tracking-wider text-dim uppercase">
                            <tr>
                                <th className="px-4 py-3">Round</th>
                                <th className="px-4 py-3">Winner</th>
                                <th className="px-4 py-3">Ticket</th>
                                <th className="px-4 py-3">Match</th>
                                <th className="px-4 py-3">Tier</th>
                                <th className="px-4 py-3 text-right">Prize</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line/60">
                            {winners.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="bg-surface-2/40 px-4 py-8 text-center text-dim">
                                        Winners will appear here after the first draw.
                                    </td>
                                </tr>
                            )}
                            {winners.map((w) => (
                                <tr key={w.id} className="bg-surface-2/40">
                                    <td className="px-4 py-3 text-dim">#{w.round_id}</td>
                                    <td className="px-4 py-3 font-semibold">{w.player}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            {w.numbers.map((n) => (
                                                <Ball key={n} n={n} active={w.drawn.includes(n)} size="sm" />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 tabular-nums">
                                        {w.matches}/{config.pick}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', w.matches >= 4 ? 'bg-violet-500/20 text-violet-300' : 'bg-sky/15 text-sky')}>
                                            {w.matches === config.pick ? 'Jackpot' : w.matches >= 4 ? 'Big win' : 'Win'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold tabular-nums">{formatCoins(w.prize, 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Prizes + fairness */}
            <section id="fair" className="mt-8 grid scroll-mt-24 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-surface p-5 ring-1 ring-line/60">
                    <div className="font-semibold">Prize table</div>
                    <div className="mt-3 divide-y divide-line/60 text-sm">
                        {config.tiers.map((t) => (
                            <div key={t.matches} className="flex justify-between py-2">
                                <span>
                                    {t.matches} of {config.pick}
                                </span>
                                <span className="font-semibold">{Math.round(t.share * 100)}% of the pool (shared)</span>
                            </div>
                        ))}
                        {config.fixed.map((f) => (
                            <div key={f.matches} className="flex justify-between py-2">
                                <span>
                                    {f.matches} of {config.pick}
                                </span>
                                <span className="font-semibold">{formatCoins(f.amount, 0)} coins</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-dim">Unwon pool shares roll over to the next hourly draw.</p>
                </div>
                <div className="rounded-2xl bg-surface p-5 ring-1 ring-line/60">
                    <div className="flex items-center gap-1.5 font-semibold">
                        <BadgeCheck className="size-4 text-lime" /> Provably fair
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-dim">
                        Before each round opens we publish the SHA-256 hash of a secret seed. After the draw the seed is revealed:
                        check that sha256(seed) matches the hash, and recompute the numbers with HMAC-SHA256(seed, "round:&#123;id&#125;:&#123;i&#125;").
                    </p>
                    <dl className="mt-3 space-y-2 text-xs">
                        <div>
                            <dt className="text-dim">Round #{round.id} seed hash</dt>
                            <dd className="mt-0.5 font-mono break-all text-white/80">{round.seed_hash}</dd>
                        </div>
                        {lastDraw && (
                            <div>
                                <dt className="text-dim">Round #{lastDraw.id} revealed seed</dt>
                                <dd className="mt-0.5 font-mono break-all text-lime">{lastDraw.server_seed}</dd>
                            </div>
                        )}
                    </dl>
                    {history.length > 0 && (
                        <div className="mt-4 flex flex-col gap-1.5">
                            {history.map((r) => (
                                <div key={r.id} className="flex items-center justify-between rounded-lg bg-surface-2/60 px-2.5 py-1.5 text-xs">
                                    <span className="text-dim">#{r.id}</span>
                                    <span className="flex gap-1">
                                        {(r.numbers ?? []).map((n) => (
                                            <Ball key={n} n={n} active size="xs" />
                                        ))}
                                    </span>
                                    <span className="flex items-center gap-1 tabular-nums">
                                        <CheckCircle2 className="size-3 text-lime" /> {formatCoinsShort(r.paid_out)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

function Ball({ n, active, size = 'md' }: { n: number; active: boolean; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
    const sz = { xs: 'size-5 text-[10px]', sm: 'size-6 text-[11px]', md: 'size-9 text-sm', lg: 'size-10 text-lg sm:size-12 sm:text-xl' }[size];
    return (
        <span
            className={cn(
                'flex items-center justify-center rounded-full font-extrabold tabular-nums',
                sz,
                active
                    ? 'bg-gradient-to-b from-[#e9ff8a] to-[#5fbf0a] text-[#173300] shadow-[inset_0_-3px_0_rgba(0,0,0,.15)]'
                    : 'bg-black/30 text-white/40 ring-1 ring-white/10',
            )}
        >
            {n > 0 ? n : '·'}
        </span>
    );
}

function TopCard({
    label,
    title,
    value,
    icon,
    tone,
    live,
    highlight,
}: {
    label: string;
    title: string;
    value: string;
    icon: typeof Ticket;
    tone: 'lime' | 'sky' | 'amber' | 'rose';
    live?: boolean;
    highlight?: boolean;
}) {
    return (
        <div
            className={cn(
                'relative flex min-h-[96px] items-center overflow-hidden rounded-2xl p-4 ring-1',
                highlight ? 'bg-gradient-to-r from-[#2b4a14] to-[#5fa316] ring-lime/50' : 'bg-surface ring-line/60',
            )}
        >
            <div className="relative z-10 min-w-0 pr-12 sm:pr-14">
                <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                    {live && <span className="size-1.5 animate-pulse rounded-full bg-lime" />}
                    {label}
                </div>
                <div className="mt-1.5 text-sm text-white/80">{title}</div>
                <div className="truncate text-xl font-extrabold tabular-nums">{value}</div>
            </div>
            <IconBadge icon={icon} tone={tone} className="absolute right-3 size-11 rotate-6 rounded-2xl sm:size-14" iconClassName="size-6 sm:size-7" />
        </div>
    );
}
