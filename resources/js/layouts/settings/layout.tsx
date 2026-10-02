import { Link, usePage } from '@inertiajs/react';
import { History, ShieldCheck, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { CoinIcon } from '@/components/casino/art';
import { formatCoins } from '@/lib/casino';
import { cn } from '@/lib/utils';

const NAV = [
    { title: 'Profile', href: '/settings/profile', icon: UserRound },
    { title: 'Security', href: '/settings/security', icon: ShieldCheck },
    { title: 'Wallet history', href: '/settings/wallet', icon: History },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage();
    const { auth, wallet, casino } = props;
    const path = url.split('?')[0];

    return (
        <div className="mx-auto max-w-5xl">
            {/* Account header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#161c28] via-[#1b3b78] to-[#2f86ff] p-5 ring-1 ring-line/60 md:p-6">
                <div className="bg-suits absolute inset-0 opacity-70" />
                <div className="relative flex flex-wrap items-center gap-4">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffb36b] to-[#e8335e] text-2xl font-extrabold">
                        {auth.user?.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <div className="text-xl font-bold">{auth.user?.name}</div>
                        <div className="truncate text-sm text-white/70">{auth.user?.email}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 rounded-xl bg-black/25 px-4 py-2.5 backdrop-blur">
                        <CoinIcon className="size-6" />
                        <div className="leading-tight">
                            <div className="text-[11px] text-white/60 uppercase">{casino.currency}</div>
                            <div className="font-bold tabular-nums">{formatCoins(wallet?.balance ?? 0)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-5 lg:flex-row">
                <nav className="scrollbar-none flex gap-1 overflow-x-auto lg:w-52 lg:shrink-0 lg:flex-col" aria-label="Settings">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                                path === item.href
                                    ? 'bg-surface-2 text-white ring-1 ring-line'
                                    : 'text-dim hover:bg-surface hover:text-white',
                            )}
                        >
                            <item.icon className={cn('size-4', path === item.href && 'text-lime')} />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <section className="min-w-0 flex-1 space-y-5 [&>div]:rounded-2xl [&>div]:bg-surface [&>div]:p-5 [&>div]:ring-1 [&>div]:ring-line/60 md:[&>div]:p-7">
                    {children}
                </section>
            </div>
        </div>
    );
}
