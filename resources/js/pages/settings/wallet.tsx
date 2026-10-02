import { Head, Link } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, Crown, Gift, Percent, Sparkles, Ticket, Trophy, Wallet } from 'lucide-react';
import Heading from '@/components/heading';
import { CoinIcon } from '@/components/casino/art';
import { formatCoins, titleCase } from '@/lib/casino';
import { cn } from '@/lib/utils';

type Tx = {
    id: number;
    type: 'welcome_bonus' | 'daily_bonus' | 'game_in' | 'game_out' | 'vip_reward' | 'cashback' | 'lottery_ticket' | 'lottery_win' | 'purchase';
    amount: number;
    balance_after: number;
    game_id: string | null;
    created_at: string;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
};

const TYPES: Record<Tx['type'], { label: string; icon: typeof Gift; tone: string }> = {
    welcome_bonus: { label: 'Welcome bonus', icon: Sparkles, tone: 'bg-lime/15 text-lime' },
    daily_bonus: { label: 'Daily free coins', icon: Gift, tone: 'bg-amber-400/15 text-amber-300' },
    game_in: { label: 'Moved to game', icon: ArrowUpRight, tone: 'bg-sky/15 text-sky' },
    game_out: { label: 'Returned from game', icon: ArrowDownLeft, tone: 'bg-violet-400/15 text-violet-300' },
    vip_reward: { label: 'VIP reward', icon: Crown, tone: 'bg-rose-400/15 text-rose-300' },
    cashback: { label: 'VIP cashback', icon: Percent, tone: 'bg-sky/15 text-sky' },
    lottery_ticket: { label: 'Lottery ticket', icon: Ticket, tone: 'bg-white/10 text-white' },
    lottery_win: { label: 'Lottery win', icon: Trophy, tone: 'bg-lime/15 text-lime' },
    purchase: { label: 'Coins purchased', icon: Wallet, tone: 'bg-amber-400/15 text-amber-300' },
};

export default function WalletHistory({
    transactions,
    stats,
}: {
    transactions: Paginated<Tx>;
    stats: { bonuses: number; net_play: number };
}) {
    return (
        <>
            <Head title="Wallet history" />

            <div className="space-y-6">
                <Heading variant="small" title="Wallet history" description="Every movement of your coins." />

                <div className="grid gap-3 sm:grid-cols-2">
                    <Stat label="Bonuses received" value={stats.bonuses} />
                    <Stat label="Net result from games" value={stats.net_play} signed />
                </div>

                {transactions.data.length === 0 ? (
                    <div className="rounded-xl bg-surface-2/60 p-8 text-center text-sm text-dim">No transactions yet.</div>
                ) : (
                    <div className="divide-y divide-line/60 overflow-hidden rounded-xl ring-1 ring-line/60">
                        {transactions.data.map((t) => {
                            const meta = TYPES[t.type] ?? TYPES.game_out;
                            return (
                                <div key={t.id} className="flex items-center gap-3 bg-surface-2/40 px-4 py-3">
                                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                                        <meta.icon className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-semibold text-white">
                                            {meta.label}
                                            {t.game_id && (
                                                <Link href={`/play/${t.game_id}`} className="ml-1.5 font-normal text-dim hover:text-white">
                                                    · {titleCase(t.game_id)}
                                                </Link>
                                            )}
                                        </div>
                                        <div className="text-xs text-dim" suppressHydrationWarning>
                                            {new Date(t.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-right tabular-nums">
                                        <div className={cn('text-sm font-bold', t.amount >= 0 ? 'text-lime' : 'text-white')}>
                                            {t.amount >= 0 ? '+' : '−'}
                                            {formatCoins(Math.abs(t.amount))}
                                        </div>
                                        <div className="text-xs text-dim">bal. {formatCoins(t.balance_after)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm">
                        <PageLink href={transactions.prev_page_url}>Previous</PageLink>
                        <span className="text-dim">
                            Page {transactions.current_page} of {transactions.last_page}
                        </span>
                        <PageLink href={transactions.next_page_url}>Next</PageLink>
                    </div>
                )}
            </div>
        </>
    );
}

function Stat({ label, value, signed }: { label: string; value: number; signed?: boolean }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-surface-2/60 p-4">
            <CoinIcon className="size-8" />
            <div>
                <div className="text-xs text-dim">{label}</div>
                <div className={cn('text-lg font-bold tabular-nums', signed && value < 0 ? 'text-red-300' : 'text-white')}>
                    {signed && value > 0 ? '+' : ''}
                    {value < 0 ? '−' : ''}
                    {formatCoins(Math.abs(value))}
                </div>
            </div>
        </div>
    );
}

function PageLink({ href, children }: { href: string | null; children: React.ReactNode }) {
    return href ? (
        <Link href={href} preserveScroll className="rounded-lg bg-surface-2 px-3 py-1.5 font-semibold text-white hover:bg-line">
            {children}
        </Link>
    ) : (
        <span className="rounded-lg px-3 py-1.5 text-dim/50">{children}</span>
    );
}
