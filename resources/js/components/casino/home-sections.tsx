import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Coins,
    Crown,
    Dices,
    Gift,
    Sparkles,
    Ticket,
    Timer,
    Trophy,
} from 'lucide-react';
import { CoinIcon, HeroArt } from '@/components/casino/art';
import { IconBadge } from '@/components/casino/icon-badge';
import type { Tone } from '@/components/casino/icon-badge';
import { formatCoins, formatCoinsShort } from '@/lib/casino';
import { cn } from '@/lib/utils';
import type { BigWin } from '@/types';

export function BigWins({ wins }: { wins: BigWin[] }) {
    if (wins.length === 0) return null;
    return (
        <section className="mb-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <Crown className="size-4 text-lime" /> Big wins
            </div>
            <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
                {wins.map((w) => (
                    <Link
                        key={w.round_id}
                        href={`/play/${w.game_id}`}
                        className="flex shrink-0 items-center gap-2 rounded-xl bg-surface p-1.5 pr-3 ring-1 ring-line/60 hover:ring-lime/50"
                    >
                        <span
                            className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-surface-2"
                            style={w.background ? { background: `linear-gradient(135deg, ${w.background[0]}, ${w.background[1]})` } : undefined}
                        >
                            {w.thumbnail ? (
                                <img src={w.thumbnail} alt="" className="size-full object-cover" />
                            ) : w.icon ? (
                                <img src={w.icon} alt="" className="size-7" />
                            ) : null}
                        </span>
                        <span className="leading-tight">
                            <span className="block max-w-28 truncate text-xs text-dim">
                                {w.player} · {w.game_name}
                            </span>
                            <span className="flex items-center gap-1 text-sm font-semibold text-white tabular-nums">
                                <CoinIcon className="size-3.5" /> {formatCoinsShort(w.win)}
                            </span>
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export function Hero({ welcomeBonus }: { welcomeBonus: number }) {
    const { auth, wallet, casino } = usePage().props;
    const loggedIn = Boolean(auth.user);

    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#161c28] via-[#1b3b78] to-[#2f86ff] ring-1 ring-line/60">
            <div className="bg-suits absolute inset-0 opacity-70" />
            <HeroArt className="pointer-events-none absolute -right-6 bottom-0 hidden h-[104%] md:block lg:right-4" />
            <div className="relative max-w-xl p-6 md:p-9">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                    <Dices className="size-3.5 text-lime" /> Welcome to ACEGG
                </span>
                {loggedIn ? (
                    <>
                        <h1 className="mt-4 text-3xl leading-[1.05] font-extrabold tracking-tight text-white md:text-[40px]">
                            Free coins
                            <br /> every 24 hours
                        </h1>
                        <p className="mt-3 text-sm text-white/75">
                            Grab {formatCoins(wallet?.daily_bonus_amount ?? 0, 0)} {casino.currency} daily and keep spinning.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <button
                                type="button"
                                disabled={!wallet?.daily_bonus_available}
                                onClick={() => router.post('/bonus/daily', {}, { preserveScroll: true })}
                                className="rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink shadow-[0_8px_30px_-8px_rgba(201,247,58,.8)] transition hover:brightness-110 disabled:bg-white/15 disabled:text-white/60 disabled:shadow-none"
                            >
                                {wallet?.daily_bonus_available ? 'Claim free coins' : 'Claimed — come back tomorrow'}
                            </button>
                            <Link
                                href="/games"
                                className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                            >
                                Browse games
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="mt-4 text-3xl leading-[1.05] font-extrabold tracking-tight text-white md:text-[40px]">
                            Claim Welcome Bonus
                            <br />
                            {formatCoins(welcomeBonus, 0)} {casino.currency}
                        </h1>
                        <p className="mt-3 text-sm text-white/75">No purchase required. Sign up and start spinning.</p>
                        <div className="mt-6 flex gap-2">
                            <Link
                                href="/register"
                                className="rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink shadow-[0_8px_30px_-8px_rgba(201,247,58,.8)] transition hover:brightness-110"
                            >
                                Registration
                            </Link>
                            <Link
                                href="/login"
                                className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                            >
                                Log In
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

const TILES: { title: string; href: string; icon: typeof Dices; tone: Tone; bg: string; soon?: boolean }[] = [
    { title: 'VIP Club', href: '/vip', icon: Crown, tone: 'amber', bg: 'from-[#4a2a10] to-[#1b2029]' },
    { title: 'Lottery', href: '/lottery', icon: Ticket, tone: 'lime', bg: 'from-[#22401a] to-[#1b2029]' },
    { title: 'Bonuses', href: '/bonuses', icon: Gift, tone: 'sky', bg: 'from-[#173a66] to-[#1b2029]' },
    { title: 'Top RTP', href: '/games?filter=top', icon: Trophy, tone: 'rose', bg: 'from-[#4a1a2a] to-[#1b2029]' },
];

export function CategoryTiles() {
    const { auth } = usePage().props;
    return (
        <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Link
                href={auth.user ? '/games' : '/register'}
                className="relative col-span-2 flex min-h-[104px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#1b2029] to-[#173f8a] p-4 ring-1 ring-line/60 transition hover:ring-sky/60"
            >
                <div className="relative z-10">
                    <div className="text-[17px] font-semibold text-white">Casino</div>
                    <div className="mt-0.5 text-xs text-white/70">Play slots & earn big</div>
                    <span className="mt-2 inline-block rounded-md bg-sky px-2.5 py-1 text-xs font-semibold text-white">
                        {auth.user ? 'Play now' : 'Registration'}
                    </span>
                </div>
                <IconBadge icon={Dices} tone="sky" className="absolute right-5 size-16 rotate-6 rounded-3xl" iconClassName="size-9" />
            </Link>
            {TILES.map((t) => (
                <Link
                    key={t.title}
                    href={t.href}
                    className={cn(
                        'relative flex min-h-[104px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 ring-1 ring-line/60 transition hover:ring-lime/50',
                        t.bg,
                    )}
                >
                    <div className="text-[15px] font-semibold text-white">{t.title}</div>
                    {t.soon ? (
                        <span className="w-fit rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/70 uppercase">soon</span>
                    ) : (
                        <span className="flex size-6 items-center justify-center rounded-full bg-white/10">
                            <ArrowRight className="size-3.5 text-white" />
                        </span>
                    )}
                    <IconBadge icon={t.icon} tone={t.tone} className="absolute right-3 bottom-3 size-12 -rotate-6" iconClassName="size-6" />
                </Link>
            ))}
        </section>
    );
}

export function Promotions() {
    const { auth, wallet, casino } = usePage().props;
    const cards = [
        {
            title: 'Daily Free Coins',
            text: `${formatCoins(wallet?.daily_bonus_amount ?? 100000, 0)} ${casino.currency} every 24 hours`,
            icon: Coins,
            tone: 'amber' as Tone,
            bg: 'from-[#5a3a0a] via-[#2a2416] to-[#1b2029]',
            action: auth.user ? (wallet?.daily_bonus_available ? 'Claim now' : 'Claimed today') : 'Sign up',
            onClick: () => (auth.user ? router.post('/bonus/daily', {}, { preserveScroll: true }) : router.visit('/register')),
            disabled: Boolean(auth.user && !wallet?.daily_bonus_available),
        },
        {
            title: 'Weekly Slots Battle',
            text: 'Climb the leaderboard and win coin prizes',
            icon: Trophy,
            tone: 'violet' as Tone,
            bg: 'from-[#3b1a66] via-[#241d38] to-[#1b2029]',
            soon: true,
        },
        {
            title: 'VIP Club',
            text: 'Level up, unlock cashback in coins and perks',
            icon: Crown,
            tone: 'rose' as Tone,
            bg: 'from-[#661a33] via-[#2e1d26] to-[#1b2029]',
            href: '/vip',
            action: 'Open VIP Club',
        },
        {
            title: 'Hourly Lottery',
            text: 'Pick 5 numbers and win a share of the pool, draws every hour',
            icon: Ticket,
            tone: 'lime' as Tone,
            bg: 'from-[#2c5a0a] via-[#202a16] to-[#1b2029]',
            href: '/lottery',
            action: 'Buy a ticket',
        },
    ];

    return (
        <section className="mt-8">
            <div id="promotions" className="mb-3 flex scroll-mt-24 items-center gap-2">
                <Gift className="size-4.5 text-lime" />
                <h2 className="text-[15px] font-semibold text-white">Promotions</h2>
            </div>
            <div className="scrollbar-none -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
                {cards.map((c) => (
                    <div
                        key={c.title}
                        className={cn(
                            'relative flex min-h-[200px] w-[80vw] shrink-0 snap-start scroll-mt-24 flex-col overflow-hidden rounded-2xl bg-gradient-to-br p-4 ring-1 ring-line/60 sm:w-auto',
                            c.bg,
                        )}
                    >
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/70">
                            <span className="rounded bg-black/30 px-1.5 py-0.5">
                                {c.soon ? 'COMING SOON' : 'ACTIVE'}
                            </span>
                            {!c.soon && (
                                <span className="flex items-center gap-1">
                                    <Timer className="size-3" /> 24h
                                </span>
                            )}
                        </div>
                        <div className="mt-3 max-w-[70%] text-lg leading-tight font-semibold text-white">{c.title}</div>
                        <p className="mt-1 max-w-[65%] text-xs text-white/70">{c.text}</p>
                        <IconBadge icon={c.icon} tone={c.tone} className="absolute -right-2 bottom-10 size-24 rotate-12 rounded-[28px]" iconClassName="size-12" />
                        <div className="mt-auto pt-4">
                            {'href' in c && c.href ? (
                                <Link href={c.href} className="rounded-lg bg-lime px-3 py-1.5 text-xs font-bold text-lime-ink">
                                    {c.action}
                                </Link>
                            ) : 'onClick' in c && c.onClick ? (
                                <button
                                    type="button"
                                    onClick={c.onClick}
                                    disabled={c.disabled}
                                    className="rounded-lg bg-lime px-3 py-1.5 text-xs font-bold text-lime-ink disabled:bg-white/15 disabled:text-white/60"
                                >
                                    {c.action}
                                </button>
                            ) : (
                                <span className="flex items-center gap-1 text-xs text-white/60">
                                    <Sparkles className="size-3.5" /> Stay tuned
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
