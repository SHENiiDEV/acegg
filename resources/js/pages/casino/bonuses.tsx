import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Coins, Crown, Gift, History, Percent, Sparkles, Ticket, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { CoinIcon } from '@/components/casino/art';
import { FeatureGrid } from '@/components/casino/feature-grid';
import { IconBadge } from '@/components/casino/icon-badge';
import type { Tone } from '@/components/casino/icon-badge';
import { PageTitle, formatLeft } from '@/components/casino/page-title';
import { useNow } from '@/hooks/use-now';
import { formatCoins, formatCoinsShort } from '@/lib/casino';
import { cn } from '@/lib/utils';
import type { VipLevel } from '@/types';

type Props = {
    welcome: { amount: number; claimed: boolean };
    daily: { amount: number; available: boolean; next_at: string | null };
    vip: {
        level: VipLevel;
        cashback: { rate: number; amount: number; available: boolean; next_at: string | null };
        unclaimed_levels: number;
        missions_ready: number;
    } | null;
    lottery: { pool: number; draws_at: string; ticket_price: number } | null;
    history: { id: number; type: string; amount: number; created_at: string }[];
};

const LABELS: Record<string, string> = {
    welcome_bonus: 'Welcome bonus',
    daily_bonus: 'Daily free coins',
    vip_reward: 'VIP reward',
    cashback: 'VIP cashback',
    lottery_win: 'Lottery win',
};

export default function Bonuses({ welcome, daily, vip, lottery, history }: Props) {
    const { auth } = usePage().props;
    const now = useNow();
    const guest = !auth.user;

    return (
        <>
            <Head title="Bonuses" />
            <PageTitle icon={Gift} title="Bonuses & Promotions" />

            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#161c28] via-[#1b3b78] to-[#2f86ff] p-6 ring-1 ring-line/60 md:p-10">
                <div className="bg-suits absolute inset-0 opacity-70" />
                <IconBadge icon={Gift} tone="sky" className="absolute top-1/2 right-10 hidden size-40 -translate-y-1/2 rotate-6 rounded-[44px] md:flex" iconClassName="size-20" />
                <div className="relative max-w-xl">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                        <Sparkles className="size-3.5 text-lime" /> Rewards hub
                    </span>
                    <h2 className="mt-4 text-3xl leading-[1.05] font-extrabold tracking-tight md:text-[42px]">
                        More coins,
                        <br />
                        more <span className="text-lime">fun</span>
                    </h2>
                    <p className="mt-3 text-sm text-white/75">Daily free coins, VIP cashback, level-up rewards and an hourly lottery — all in one place.</p>
                </div>
            </section>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <BonusCard
                    tone="amber"
                    icon={Coins}
                    bg="from-[#5a3a0a] to-[#1b2029]"
                    tag={guest ? 'Sign up' : daily.available ? 'Ready' : 'Claimed'}
                    title="Daily Free Coins"
                    amount={daily.amount}
                    text="Claim free coins every 24 hours."
                    action={
                        guest ? (
                            <CTA href="/register">Sign up</CTA>
                        ) : daily.available ? (
                            <CTA onClick={() => router.post('/bonus/daily', {}, { preserveScroll: true })}>Claim now</CTA>
                        ) : (
                            <Muted>Next in {formatLeft(now === null ? null : new Date(daily.next_at ?? 0).getTime() - now)}</Muted>
                        )
                    }
                />
                <BonusCard
                    tone="lime"
                    icon={Sparkles}
                    bg="from-[#2c5a0a] to-[#1b2029]"
                    tag={welcome.claimed ? 'Received' : 'New players'}
                    title="Welcome Bonus"
                    amount={welcome.amount}
                    text="Credited automatically when you create your account."
                    action={welcome.claimed ? <Muted icon>Received</Muted> : <CTA href="/register">Get bonus</CTA>}
                />
                <BonusCard
                    tone="sky"
                    icon={Percent}
                    bg="from-[#173a66] to-[#1b2029]"
                    tag={vip ? `${vip.level.name} · ${vip.cashback.rate}%` : 'VIP'}
                    title="VIP Cashback"
                    amount={vip?.cashback.amount ?? null}
                    text="A share of your weekly net losses back in coins."
                    action={
                        !vip ? (
                            <CTA href="/vip">Learn more</CTA>
                        ) : vip.cashback.available ? (
                            <CTA onClick={() => router.post('/vip/cashback', {}, { preserveScroll: true })}>Claim cashback</CTA>
                        ) : (
                            <Muted>{vip.cashback.next_at ? `Next in ${formatLeft(now === null ? null : new Date(vip.cashback.next_at).getTime() - now)}` : 'Play to earn cashback'}</Muted>
                        )
                    }
                />
                <BonusCard
                    tone="rose"
                    icon={Crown}
                    bg="from-[#661a33] to-[#1b2029]"
                    tag="VIP Club"
                    title="Level-up Rewards"
                    amount={null}
                    text={vip ? `${vip.unclaimed_levels} level reward(s) and ${vip.missions_ready} mission(s) ready to claim.` : 'Climb from Bronze to Diamond for big coin rewards.'}
                    action={<CTA href="/vip">{vip && vip.unclaimed_levels + vip.missions_ready > 0 ? 'Claim in VIP Club' : 'Open VIP Club'}</CTA>}
                />
                <BonusCard
                    tone="violet"
                    icon={Ticket}
                    bg="from-[#3b1a66] to-[#1b2029]"
                    tag={lottery ? `Draw in ${formatLeft(now === null ? null : new Date(lottery.draws_at).getTime() - now)}` : 'Hourly'}
                    title="Hourly Lottery"
                    amount={lottery?.pool ?? null}
                    text={lottery ? `Prize pool. Tickets cost ${formatCoins(lottery.ticket_price, 0)} coins.` : 'Pick 5 numbers, draws every hour.'}
                    action={<CTA href="/lottery">Buy a ticket</CTA>}
                />
                <BonusCard
                    tone="amber"
                    icon={Trophy}
                    bg="from-[#4a2a10] to-[#1b2029]"
                    tag="Coming soon"
                    title="Weekly Slots Battle"
                    amount={null}
                    text="Climb the leaderboard and win coin prizes."
                    action={<Muted>Stay tuned</Muted>}
                />
            </div>

            {history.length > 0 && (
                <section className="mt-8">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-sm font-semibold">
                            <History className="size-4 text-lime" /> Bonus history
                        </span>
                        <Link href="/settings/wallet" className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold hover:bg-line">
                            Full wallet history
                        </Link>
                    </div>
                    <div className="divide-y divide-line/60 overflow-hidden rounded-2xl ring-1 ring-line/60">
                        {history.map((h) => (
                            <div key={h.id} className="flex items-center justify-between bg-surface-2/40 px-4 py-3 text-sm">
                                <span className="font-semibold">{LABELS[h.type] ?? h.type}</span>
                                <span className="text-xs text-dim" suppressHydrationWarning>
                                    {new Date(h.created_at).toLocaleString()}
                                </span>
                                <span className="font-bold text-lime tabular-nums">+{formatCoins(h.amount)}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <FeatureGrid />
        </>
    );
}

function BonusCard({
    tone,
    icon,
    bg,
    tag,
    title,
    amount,
    text,
    action,
}: {
    tone: Tone;
    icon: typeof Gift;
    bg: string;
    tag: string;
    title: string;
    amount: number | null;
    text: string;
    action: ReactNode;
}) {
    return (
        <div className={cn('relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br p-5 ring-1 ring-line/60', bg)}>
            <div className="bg-suits absolute inset-0 opacity-60" />
            <IconBadge icon={icon} tone={tone} className="absolute top-5 right-5 size-20 rotate-12 rounded-[26px]" iconClassName="size-10" />
            <div className="relative">
                <span className="rounded-md bg-black/30 px-2 py-0.5 text-[11px] font-semibold text-white/80">{tag}</span>
                <div className="mt-3 max-w-[65%] text-lg font-bold">{title}</div>
                {amount !== null && (
                    <div className="mt-1 flex items-center gap-1.5 text-2xl font-extrabold tabular-nums">
                        <CoinIcon className="size-6" /> {formatCoinsShort(amount)}
                    </div>
                )}
                <p className="mt-1 max-w-[75%] text-xs leading-snug text-white/70">{text}</p>
            </div>
            <div className="relative mt-auto pt-4">{action}</div>
        </div>
    );
}

function CTA({ children, href, onClick }: { children: ReactNode; href?: string; onClick?: () => void }) {
    const cls = 'inline-flex rounded-lg bg-lime px-4 py-2 text-sm font-bold text-lime-ink transition hover:brightness-110';
    return href ? (
        <Link href={href} className={cls}>
            {children}
        </Link>
    ) : (
        <button type="button" onClick={onClick} className={cls}>
            {children}
        </button>
    );
}

function Muted({ children, icon }: { children: ReactNode; icon?: boolean }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/25 px-3 py-2 text-xs font-semibold text-white/70 tabular-nums">
            {icon && <CheckCircle2 className="size-3.5 text-lime" />}
            {children}
        </span>
    );
}
