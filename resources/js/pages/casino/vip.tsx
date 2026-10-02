import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarCheck, CheckCircle2, Coins, Crown, Gift, Lock, Percent, Shield, Target, TrendingUp } from 'lucide-react';
import { Medal } from '@/components/casino/art';
import { FeatureGrid } from '@/components/casino/feature-grid';
import { IconBadge } from '@/components/casino/icon-badge';
import { PageTitle, formatLeft } from '@/components/casino/page-title';
import { useNow } from '@/hooks/use-now';
import { formatCoins } from '@/lib/casino';
import { cn } from '@/lib/utils';
import type { VipLevel } from '@/types';

type Mission = {
    key: string;
    title: string;
    text: string;
    progress: number;
    target: number;
    reward: number;
    claimed: boolean;
    action: 'claim' | 'daily' | 'cashback';
};
type LevelRow = VipLevel & { index: number; reached: boolean; reward_claimed: boolean };
type Vip = {
    xp: number;
    level: number;
    levels: LevelRow[];
    next_xp: number | null;
    missions: Mission[];
    cashback: { rate: number; amount: number; available: boolean; next_at: string | null; net_loss: number };
};

const MISSION_ICONS = { daily_wager: Target, daily_bonus: Gift, cashback: Percent, weekly_activity: CalendarCheck } as Record<string, typeof Target>;

export default function VipPage({ vip, levels }: { vip: Vip | null; levels: VipLevel[] }) {
    const { auth } = usePage().props;
    const current = vip ? vip.levels[vip.level] : levels[0];
    const done = vip ? vip.missions.filter((m) => m.claimed).length : 0;

    return (
        <>
            <Head title="VIP Club" />
            <PageTitle icon={Crown} title="VIP Program" />

            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1b2029] via-[#2b4a14] to-[#7ccf1f] ring-1 ring-line/60">
                <div className="bg-suits absolute inset-0 opacity-70" />
                <div className="pointer-events-none absolute right-6 bottom-0 hidden h-full items-end gap-2 md:flex">
                    {levels.slice(1).map((l, i) => (
                        <Medal key={l.name} color={l.color} className={cn('drop-shadow-2xl', ['size-24', 'size-32', 'size-44', 'size-32'][i])} />
                    ))}
                </div>
                <div className="relative max-w-xl p-6 md:p-10">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                        <Crown className="size-3.5 text-lime" /> VIP Program
                    </span>
                    <h2 className="mt-4 text-3xl leading-[1.05] font-extrabold tracking-tight md:text-[42px]">
                        Unlock Exclusive
                        <br />
                        VIP Rewards
                    </h2>
                    <p className="mt-3 max-w-sm text-sm text-white/75">
                        Earn VIP points on every spin to unlock cashback, level-up rewards and exclusive perks.
                    </p>
                    {auth.user ? (
                        <Link href="/games" className="mt-6 inline-block rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink">
                            Earn XP now
                        </Link>
                    ) : (
                        <Link href="/register" className="mt-6 inline-block rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink">
                            Join VIP
                        </Link>
                    )}
                </div>
            </section>

            {/* Challenges */}
            <section className="mt-10">
                <h2 className="text-xl font-bold">VIP Challenges</h2>
                <p className="text-sm text-dim">Complete tasks, earn VIP points and progress through the VIP Program</p>

                <div className="mt-5 grid gap-4 lg:grid-cols-[340px_1fr] [&>*]:min-w-0">
                    <div className="flex flex-col rounded-2xl bg-surface p-5 ring-1 ring-line/60">
                        <Medal color={current.color} className="mx-auto size-36 sm:size-48" />
                        <div className="mt-auto rounded-xl bg-surface-2/70 p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1.5 font-semibold">
                                    <Shield className="size-4 text-sky" /> Your Level
                                </span>
                                <span className="flex items-center gap-1.5 font-semibold" style={{ color: current.color }}>
                                    ◆ {current.name}
                                </span>
                            </div>
                            {vip ? (
                                <>
                                    <div className="mt-3 flex justify-between text-xs text-white/80 tabular-nums">
                                        <span>{vip.xp.toLocaleString('en-US')} XP</span>
                                        <span>{vip.next_xp ? `${vip.next_xp.toLocaleString('en-US')} XP` : 'MAX'}</span>
                                    </div>
                                    <Bar value={vip.next_xp ? vip.xp / vip.next_xp : 1} />
                                    <p className="mt-2 text-xs text-dim">1 XP for every coin wagered in games.</p>
                                </>
                            ) : (
                                <p className="mt-3 text-xs text-dim">
                                    <Link href="/login" className="font-semibold text-lime">
                                        Log in
                                    </Link>{' '}
                                    to see your progress.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-surface p-4 ring-1 ring-line/60 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="font-semibold">VIP Missions</div>
                                <div className="text-xs text-dim">Finish challenges to level up and claim exclusive VIP rewards</div>
                            </div>
                            <span className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-sm font-bold tabular-nums">
                                <Target className="size-4 text-dim" /> {done} <span className="text-dim">/ {vip?.missions.length ?? 4}</span>
                            </span>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            {(vip?.missions ?? []).map((m) => (
                                <MissionRow key={m.key} m={m} />
                            ))}
                            {!vip && (
                                <div className="rounded-xl bg-surface-2/60 p-8 text-center text-sm text-dim">
                                    <Lock className="mx-auto mb-2 size-5" /> Sign in to unlock VIP missions.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Levels */}
            <section className="mt-10">
                <h2 className="text-xl font-bold">VIP Levels</h2>
                <p className="text-sm text-dim">The higher your level, the bigger your cashback and level-up rewards</p>
                <div className="scrollbar-none -mx-3 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 xl:grid-cols-5">
                    {(vip?.levels ?? levels.map((l, i) => ({ ...l, index: i, reached: false, reward_claimed: true }))).map((l) => {
                        const isCurrent = vip?.level === l.index;
                        const claimable = l.reached && !l.reward_claimed;
                        return (
                            <div
                                key={l.name}
                                className={cn(
                                    'relative flex w-[44vw] shrink-0 snap-start flex-col items-center rounded-2xl bg-surface p-4 text-center ring-1 ring-line/60 md:w-auto',
                                    isCurrent && 'ring-2 ring-lime',
                                )}
                            >
                                {isCurrent && (
                                    <span className="absolute top-2 right-2 rounded bg-lime px-1.5 text-[10px] font-bold text-lime-ink">YOU</span>
                                )}
                                <Medal color={l.color} className={cn('size-24', !l.reached && vip && 'opacity-50 grayscale')} />
                                <div className="mt-1 font-bold" style={{ color: l.color }}>
                                    {l.name}
                                </div>
                                <div className="text-xs text-dim">{l.xp.toLocaleString('en-US')} XP</div>
                                <div className="mt-3 w-full space-y-1.5 text-left text-xs">
                                    <Perk icon={Percent} label="Cashback" value={`${l.cashback}%`} />
                                    <Perk icon={Coins} label="Level reward" value={l.reward ? formatCoins(l.reward, 0) : '—'} />
                                </div>
                                {claimable ? (
                                    <button
                                        type="button"
                                        onClick={() => router.post(`/vip/levels/${l.index}`, {}, { preserveScroll: true })}
                                        className="mt-3 w-full rounded-lg bg-lime py-1.5 text-xs font-bold text-lime-ink"
                                    >
                                        Claim reward
                                    </button>
                                ) : l.reached && l.reward ? (
                                    <span className="mt-3 flex items-center gap-1 text-xs text-lime">
                                        <CheckCircle2 className="size-3.5" /> Claimed
                                    </span>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </section>

            {vip && <CashbackCard c={vip.cashback} />}

            <FeatureGrid />
        </>
    );
}

function MissionRow({ m }: { m: Mission }) {
    const Icon = MISSION_ICONS[m.key] ?? Target;
    const complete = m.progress >= m.target;
    const onClick = () => {
        if (m.action === 'daily') router.post('/bonus/daily', {}, { preserveScroll: true });
        else if (m.action === 'cashback') router.post('/vip/cashback', {}, { preserveScroll: true });
        else router.post(`/vip/missions/${m.key}`, {}, { preserveScroll: true });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2/60 p-3 sm:flex-nowrap">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-page text-lime">
                <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{m.title}</div>
                <div className="text-xs leading-snug text-dim sm:truncate">{m.text}</div>
                {m.target > 1 && !m.claimed && (
                    <div className="mt-1.5 flex items-center gap-2">
                        <Bar value={m.progress / m.target} className="mt-0 flex-1" />
                        <span className="text-[11px] text-dim tabular-nums">
                            {m.key === 'daily_wager' ? `${formatCoins(m.progress, 0)} / ${formatCoins(m.target, 0)}` : `${m.progress}/${m.target}`}
                        </span>
                    </div>
                )}
            </div>
            {m.reward > 0 && !m.claimed && (
                <span className="hidden text-xs font-semibold text-amber-300 sm:block">+{formatCoins(m.reward, 0)}</span>
            )}
            {m.claimed ? (
                <span className="flex items-center gap-1.5 rounded-lg bg-lime/15 px-3 py-2 text-sm font-semibold text-lime">
                    <CheckCircle2 className="size-4" /> Done
                </span>
            ) : complete || m.action !== 'claim' ? (
                <button
                    type="button"
                    onClick={onClick}
                    disabled={!complete}
                    className="rounded-lg bg-lime px-4 py-2 text-sm font-bold text-lime-ink disabled:bg-line disabled:text-dim"
                >
                    Claim
                </button>
            ) : (
                <Link href="/games" className="rounded-lg bg-sky px-4 py-2 text-sm font-semibold text-white">
                    Start
                </Link>
            )}
        </div>
    );
}

function CashbackCard({ c }: { c: Vip['cashback'] }) {
    const now = useNow();
    return (
        <section className="mt-6 flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1b2029] to-[#173f8a] p-5 ring-1 ring-line/60 md:flex-row md:items-center">
            <IconBadge icon={TrendingUp} tone="sky" className="size-16 rounded-2xl" iconClassName="size-8" />
            <div className="flex-1">
                <div className="text-lg font-bold">Weekly VIP Cashback · {c.rate}%</div>
                <p className="text-sm text-white/70">
                    Net losses since your last claim: {formatCoins(c.net_loss)} coins. Cashback available:{' '}
                    <b className="text-white">{formatCoins(c.amount)}</b>
                </p>
            </div>
            <button
                type="button"
                disabled={!c.available}
                onClick={() => router.post('/vip/cashback', {}, { preserveScroll: true })}
                className="rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink disabled:bg-white/10 disabled:text-white/60"
            >
                {c.available ? 'Claim cashback' : c.next_at ? `Next in ${formatLeft(now === null ? null : new Date(c.next_at).getTime() - now)}` : 'Nothing to claim yet'}
            </button>
        </section>
    );
}

function Perk({ icon: Icon, label, value }: { icon: typeof Coins; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-surface-2/60 px-2 py-1.5">
            <span className="flex items-center gap-1.5 text-dim">
                <Icon className="size-3.5" /> {label}
            </span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}

function Bar({ value, className }: { value: number; className?: string }) {
    return (
        <div className={cn('mt-2 h-1.5 overflow-hidden rounded-full bg-page', className)}>
            <div className="h-full rounded-full bg-gradient-to-r from-lime to-[#7ccf1f]" style={{ width: `${Math.min(100, Math.max(2, value * 100))}%` }} />
        </div>
    );
}
