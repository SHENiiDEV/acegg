import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, Coins, Gamepad2, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { CoinIcon, HeroArt, Logo } from '@/components/casino/art';
import { IconBadge } from '@/components/casino/icon-badge';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { formatCoins } from '@/lib/casino';
import { cn } from '@/lib/utils';

/**
 * Split auth screen in the ACEGG style: form on the left, promo panel on the right.
 * Every auth page passes title/description via `Page.layout = { ... }`.
 */
export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: ReactNode;
}) {
    useFlashToast();
    const { component, props } = usePage();
    const { casino, name } = props;
    const isRegister = component === 'auth/register';

    return (
        <div className="flex min-h-svh items-start bg-page text-white">
            {/* Form side */}
            <div
                className={cn(
                    'bg-suits relative flex min-h-svh w-full flex-col px-5 py-6 sm:px-10 lg:shrink-0',
                    isRegister ? 'lg:w-[600px] xl:w-[680px]' : 'lg:w-[520px] xl:w-[580px]',
                )}
            >
                <div className="flex items-center justify-between">
                    <Link href="/">
                        <Logo />
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-1 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-line"
                    >
                        <ChevronLeft className="size-3.5" /> Lobby
                    </Link>
                </div>

                {/* Mobile promo strip */}
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#1b3b78] to-[#2f86ff] p-4 lg:hidden">
                    <CoinIcon className="size-9 shrink-0" />
                    <div className="text-sm leading-tight">
                        <div className="font-bold">
                            {formatCoins(casino.welcome_bonus, 0)} {casino.currency} welcome bonus
                        </div>
                        <div className="text-white/70">Free to play · no purchase required</div>
                    </div>
                </div>

                <div className="flex flex-1 flex-col justify-center py-8">
                    <div className={cn('mx-auto w-full', isRegister ? 'max-w-[540px]' : 'max-w-[400px]')}>
                        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{title}</h1>
                        {description && <p className="mt-1.5 text-sm text-dim">{description}</p>}
                        <div className="mt-8 [&_label]:text-[13px] [&_label]:font-medium [&_label]:text-white/85">
                            {children}
                        </div>
                    </div>
                </div>

                <p className="text-center text-[11px] leading-relaxed text-dim">
                    {name} is a free-to-play social casino for adults (18+). {casino.currency} have no cash value.{' '}
                    <Link href="/legal/terms" className="underline-offset-2 hover:text-white hover:underline">
                        Terms
                    </Link>{' '}
                    ·{' '}
                    <Link href="/legal/privacy" className="underline-offset-2 hover:text-white hover:underline">
                        Privacy
                    </Link>
                </p>
            </div>

            {/* Promo side */}
            <div className="relative hidden h-svh flex-1 overflow-hidden p-4 lg:sticky lg:top-0 lg:block">
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[#161c28] via-[#1b3b78] to-[#2f86ff] p-10 ring-1 ring-line/60 xl:p-14">
                    <div className="bg-suits absolute inset-0 opacity-70" />
                    <div className="relative">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                            <Sparkles className="size-3.5 text-lime" /> {isRegister ? 'New player offer' : 'Welcome back'}
                        </span>
                        <h2 className="mt-5 max-w-lg text-4xl leading-[1.05] font-extrabold tracking-tight xl:text-5xl">
                            {isRegister ? (
                                <>
                                    Get {formatCoins(casino.welcome_bonus, 0)}
                                    <br />
                                    <span className="text-lime">{casino.currency}</span> for free
                                </>
                            ) : (
                                <>
                                    Your next
                                    <br />
                                    <span className="text-lime">big win</span> is waiting
                                </>
                            )}
                        </h2>
                        <p className="mt-4 max-w-md text-white/75">
                            Spin 100+ slots — Megaways, Cluster Pays, Hold & Win and more. Coins are for entertainment
                            only and have no cash value.
                        </p>
                    </div>

                    <HeroArt className="relative mx-auto mt-auto w-full max-w-[560px]" />

                    <div className="relative mt-6 grid grid-cols-3 gap-3">
                        {[
                            { icon: Coins, tone: 'amber' as const, t: 'Free coins daily', d: `${formatCoins(casino.daily_bonus, 0)} every 24h` },
                            { icon: Gamepad2, tone: 'sky' as const, t: '100+ slots', d: 'New games every week' },
                            { icon: ShieldCheck, tone: 'lime' as const, t: 'Secure & fair', d: 'Provably fair, 18+ only' },
                        ].map((f) => (
                            <div key={f.t} className="flex items-center gap-3 rounded-2xl bg-black/25 p-3 backdrop-blur">
                                <IconBadge icon={f.icon} tone={f.tone} className="size-11 shrink-0 rounded-xl" iconClassName="size-5" />
                                <div className="min-w-0 leading-tight">
                                    <div className="text-sm font-semibold">{f.t}</div>
                                    <div className="truncate text-xs text-white/65">{f.d}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
