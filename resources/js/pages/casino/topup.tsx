import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, BadgeCheck, CheckCircle2, Clock, Coins, Lock, ShieldCheck, Sparkles, Wallet, XCircle, Zap } from 'lucide-react';
import { useState } from 'react';
import { CoinIcon } from '@/components/casino/art';
import { IconBadge } from '@/components/casino/icon-badge';
import { PageTitle } from '@/components/casino/page-title';
import { formatCoins } from '@/lib/casino';
import { cn } from '@/lib/utils';

type Package = { id: string; name: string; price: number; bonus: number; badge: string | null; coins: number; bonus_coins: number };
type CurrencyInfo = {
    code: string;
    symbol: string;
    name: string;
    coins_per_cent: number;
    min: number;
    max: number;
    daily_limit: number;
    presets: number[];
    packages: Package[];
};
type Settings = { currency: string; symbol: string; coins_per_cent: number; min: number; max: number; daily_limit: number; sandbox: boolean };
type PaymentRow = { id: string; package: string | null; amount: number; currency: string; currency_symbol?: string; coins: number; bonus_coins: number; status: string; created_at: string };

const money = (cents: number, symbol: string) => `${symbol}${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const TONES = ['amber', 'sky', 'lime', 'violet', 'rose', 'amber'] as const;

export default function Topup({
    currencies,
    defaultCurrency,
    packages: initialPackages,
    settings: initialSettings,
    missingProfile,
    recent,
}: {
    currencies?: Record<string, CurrencyInfo>;
    defaultCurrency?: string;
    packages?: Package[];
    settings?: Settings;
    missingProfile: string[];
    recent: PaymentRow[];
}) {
    const { auth, wallet } = usePage().props;
    const currencyList = currencies ? Object.values(currencies) : [];
    const [activeCurrencyCode, setActiveCurrencyCode] = useState<string>(
        defaultCurrency || initialSettings?.currency || 'GBP'
    );

    const activeCurrency: CurrencyInfo = currencies?.[activeCurrencyCode] ?? {
        code: initialSettings?.currency || 'GBP',
        symbol: initialSettings?.symbol || '£',
        name: `${initialSettings?.currency || 'GBP'} (${initialSettings?.symbol || '£'})`,
        coins_per_cent: initialSettings?.coins_per_cent || 12000,
        min: initialSettings?.min || 400,
        max: initialSettings?.max || 85000,
        daily_limit: initialSettings?.daily_limit || 170000,
        presets: [10, 25, 50, 100],
        packages: initialPackages || [],
    };

    const packages = activeCurrency.packages;
    const [selected, setSelected] = useState<string | null>(packages.find((p) => p.badge === 'Most popular')?.id ?? packages[0]?.id ?? null);
    const [custom, setCustom] = useState('');
    const [busy, setBusy] = useState(false);

    const customCents = Math.round((parseFloat(custom.replace(',', '.')) || 0) * 100);
    const customValid = customCents >= activeCurrency.min && customCents <= activeCurrency.max;
    const pkg = packages.find((p) => p.id === selected) ?? null;
    const usingCustom = selected === null;
    const summary = usingCustom
        ? { price: customCents, coins: customCents * activeCurrency.coins_per_cent, bonus: 0 }
        : pkg
          ? { price: pkg.price, coins: pkg.coins, bonus: pkg.bonus_coins }
          : null;
    const canPay = Boolean(auth.user) && missingProfile.length === 0 && (usingCustom ? customValid : Boolean(pkg));

    const pay = () => {
        setBusy(true);
        router.post(
            '/topup',
            usingCustom ? { amount: customCents / 100, currency: activeCurrency.code } : { package: selected, currency: activeCurrency.code },
            { onFinish: () => setBusy(false) }
        );
    };

    return (
        <>
            <Head title="Top up" />
            <PageTitle icon={Wallet} title="Top up coins" />

            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#161c28] via-[#1b3b78] to-[#2f86ff] p-6 ring-1 ring-line/60 md:p-8">
                <div className="bg-suits absolute inset-0 opacity-70" />
                <IconBadge icon={Coins} tone="amber" className="absolute top-1/2 right-10 hidden size-36 -translate-y-1/2 rotate-6 rounded-[40px] md:flex" iconClassName="size-18" />
                <div className="relative max-w-xl">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                        <Sparkles className="size-3.5 text-lime" /> Up to +50% bonus coins
                    </span>
                    <h2 className="mt-4 text-3xl leading-[1.05] font-extrabold tracking-tight md:text-[40px]">
                        Get more coins,
                        <br /> keep the <span className="text-lime">fun</span> going
                    </h2>
                    {wallet && (
                        <p className="mt-3 flex items-center gap-2 text-sm text-white/80">
                            Current balance: <CoinIcon className="size-4" /> <b className="text-white tabular-nums">{formatCoins(wallet.balance)}</b>
                        </p>
                    )}
                </div>
            </section>

            {auth.user && missingProfile.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-sky/30 bg-sky/10 px-4 py-3 text-sm text-sky">
                    <ShieldCheck className="size-4 shrink-0" />
                    <span className="flex-1">Payment providers require your full personal details (name, phone, date of birth, address) before the first purchase.</span>
                    <Link href="/settings/profile" className="rounded-lg bg-sky px-3 py-1.5 text-xs font-bold text-white">
                        Complete profile
                    </Link>
                </div>
            )}

            <div className="mt-5 grid gap-5 pb-20 xl:grid-cols-[1fr_360px] xl:pb-0 [&>*]:min-w-0">
                <div>
                    {/* Currency Selector */}
                    {currencyList.length > 1 && (
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-2.5 ring-1 ring-line/60">
                            <span className="px-2 text-xs font-semibold text-dim uppercase">Currency:</span>
                            <div className="flex gap-1.5">
                                {currencyList.map((c) => (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => {
                                            setActiveCurrencyCode(c.code);
                                            // Keep package selection or reset custom
                                        }}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition',
                                            activeCurrencyCode === c.code
                                                ? 'bg-lime text-lime-ink shadow-sm'
                                                : 'bg-surface-2 text-white/80 hover:bg-line hover:text-white',
                                        )}
                                    >
                                        <span className="font-mono">{c.symbol}</span>
                                        <span>{c.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Packages */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {packages.map((p, i) => {
                            const on = selected === p.id;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setSelected(p.id)}
                                    className={cn(
                                        'relative flex flex-col items-center overflow-hidden rounded-2xl bg-surface p-4 pt-5 text-center ring-1 transition hover:-translate-y-0.5',
                                        on ? 'ring-2 ring-lime' : 'ring-line/60 hover:ring-line',
                                    )}
                                >
                                    {p.badge && (
                                        <span className="absolute top-0 inset-x-0 bg-lime py-0.5 text-[10px] font-bold tracking-wide text-lime-ink uppercase">{p.badge}</span>
                                    )}
                                    <IconBadge icon={i > 3 ? Zap : Coins} tone={TONES[i % TONES.length]} className="mt-2 size-14 rounded-2xl" iconClassName="size-7" />
                                    <div className="mt-3 text-xs font-semibold text-dim uppercase">{p.name}</div>
                                    <div className="mt-1 flex items-center gap-1.5 text-xl font-extrabold tabular-nums">
                                        <CoinIcon className="size-5" /> {formatCoins(p.coins + p.bonus_coins, 0)}
                                    </div>
                                    <div className="mt-1 h-5 text-xs">
                                        {p.bonus > 0 && (
                                            <span className="rounded-md bg-lime/15 px-1.5 py-0.5 font-bold text-lime">
                                                +{p.bonus}% · {formatCoins(p.bonus_coins, 0)} bonus
                                            </span>
                                        )}
                                    </div>
                                    <div className={cn('mt-3 w-full rounded-xl py-2 text-sm font-bold', on ? 'bg-lime text-lime-ink' : 'bg-surface-2 text-white')}>
                                        {money(p.price, activeCurrency.symbol)}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom amount */}
                    <div
                        className={cn(
                            'mt-3 rounded-2xl bg-surface p-5 ring-1 transition',
                            usingCustom ? 'ring-2 ring-lime' : 'ring-line/60',
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">Enter your own amount</div>
                                <div className="text-xs text-dim">
                                    {money(activeCurrency.min, activeCurrency.symbol)} – {money(activeCurrency.max, activeCurrency.symbol)} · {formatCoins(100 * activeCurrency.coins_per_cent, 0)} coins per{' '}
                                    {money(100, activeCurrency.symbol)}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <label className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-line bg-surface-2/70 px-4 focus-within:border-lime/70 focus-within:ring-4 focus-within:ring-lime/15">
                                <span className="text-lg font-bold text-dim">{activeCurrency.symbol}</span>
                                <input
                                    inputMode="decimal"
                                    value={custom}
                                    onFocus={() => setSelected(null)}
                                    onChange={(e) => {
                                        setSelected(null);
                                        setCustom(e.target.value.replace(/[^0-9.,]/g, ''));
                                    }}
                                    placeholder="0.00"
                                    className="w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-dim/60"
                                />
                            </label>
                            <div className="flex gap-1.5">
                                {activeCurrency.presets.map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => {
                                            setSelected(null);
                                            setCustom(String(v));
                                        }}
                                        className="rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold hover:bg-line"
                                    >
                                        {activeCurrency.symbol}
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {usingCustom && custom !== '' && !customValid && (
                            <p className="mt-2 text-xs text-red-300">
                                Enter an amount between {money(activeCurrency.min, activeCurrency.symbol)} and {money(activeCurrency.max, activeCurrency.symbol)}.
                            </p>
                        )}
                        {usingCustom && customValid && (
                            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                                You get <CoinIcon className="size-4" /> <b className="text-white">{formatCoins(customCents * activeCurrency.coins_per_cent, 0)}</b> coins
                            </p>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <aside className="flex flex-col gap-3 self-start xl:sticky xl:top-24">
                    <div className="rounded-2xl bg-surface p-5 ring-1 ring-line/60">
                        <div className="font-semibold">Order summary</div>
                        <dl className="mt-4 space-y-2 text-sm">
                            <Row label="Currency" value={`${activeCurrency.code} (${activeCurrency.symbol})`} />
                            <Row label="Package" value={usingCustom ? 'Custom amount' : (pkg?.name ?? '—')} />
                            <Row label="Coins" value={summary ? formatCoins(summary.coins, 0) : '—'} />
                            <Row label="Bonus coins" value={summary && summary.bonus > 0 ? `+${formatCoins(summary.bonus, 0)}` : '—'} accent />
                            <div className="my-3 h-px bg-line/60" />
                            <Row label="You receive" value={summary ? formatCoins(summary.coins + summary.bonus, 0) : '—'} big />
                            <Row label="Total to pay" value={summary && summary.price > 0 ? money(summary.price, activeCurrency.symbol) : '—'} big />
                        </dl>
                        {auth.user ? (
                            <button
                                type="button"
                                onClick={pay}
                                disabled={!canPay || busy}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-lime-ink shadow-[0_8px_24px_-10px_rgba(201,247,58,.9)] transition hover:brightness-110 disabled:bg-line disabled:text-dim disabled:shadow-none"
                            >
                                <Lock className="size-4" />
                                {busy ? 'Redirecting…' : summary && summary.price > 0 ? `Pay ${money(summary.price, activeCurrency.symbol)}` : 'Choose an amount'}
                            </button>
                        ) : (
                            <Link href="/login" className="mt-5 block rounded-xl bg-lime py-3.5 text-center text-sm font-bold text-lime-ink">
                                Log in to buy coins
                            </Link>
                        )}
                        <p className="mt-3 text-[11px] leading-relaxed text-dim">
                            Coins are a virtual currency for entertainment only. They have no cash value and cannot be withdrawn. By paying you agree to the{' '}
                            <Link href="/legal/payments-refunds" className="text-lime hover:underline">
                                Payments & Refunds
                            </Link>{' '}
                            policy.
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-2xl bg-surface p-3 ring-1 ring-line/60">
                        {['visa', 'mastercard', 'pci-dss'].map((l) => (
                            <span key={l} className="flex h-9 items-center rounded-lg bg-white px-3">
                                <img src={`/images/payments/${l}.png`} alt={l} className="h-5 w-auto" />
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 px-1 text-xs text-dim">
                        <BadgeCheck className="size-4 text-lime" /> Secure checkout · 256-bit SSL · Daily limit {money(activeCurrency.daily_limit, activeCurrency.symbol)}
                    </div>
                </aside>
            </div>

            {/* Phones: sticky pay bar above the tab bar */}
            {auth.user && summary && summary.price > 0 && (
                <div
                    className="fixed inset-x-0 z-40 border-t border-white/5 bg-panel/90 px-4 py-3 backdrop-blur-xl xl:hidden"
                    style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
                >
                    <div className="mx-auto flex max-w-md items-center gap-3">
                        <div className="min-w-0 flex-1 leading-tight">
                            <div className="flex items-center gap-1.5 text-base font-extrabold tabular-nums">
                                <CoinIcon className="size-4" /> {formatCoins(summary.coins + summary.bonus, 0)}
                            </div>
                            <div className="text-xs text-dim">{usingCustom ? 'Custom amount' : pkg?.name}</div>
                        </div>
                        <button
                            type="button"
                            onClick={pay}
                            disabled={!canPay || busy}
                            className="flex items-center gap-2 rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink shadow-[0_8px_24px_-10px_rgba(201,247,58,.9)] disabled:bg-line disabled:text-dim disabled:shadow-none"
                        >
                            <Lock className="size-4" /> {busy ? '…' : `Pay ${money(summary.price, activeCurrency.symbol)}`}
                        </button>
                    </div>
                </div>
            )}

            {recent.length > 0 && (
                <section className="mt-8">
                    <div className="mb-3 text-sm font-semibold">Recent purchases</div>
                    <div className="divide-y divide-line/60 overflow-hidden rounded-2xl ring-1 ring-line/60">
                        {recent.map((p) => (
                            <Link key={p.id} href={`/topup/${p.id}`} className="flex items-center gap-3 bg-surface-2/40 px-4 py-3 text-sm hover:bg-surface-2/70">
                                <StatusIcon status={p.status} />
                                <span className="flex-1">
                                    <span className="font-semibold">{p.package ? p.package.charAt(0).toUpperCase() + p.package.slice(1) : 'Custom amount'}</span>
                                    <span className="ml-2 text-xs text-dim" suppressHydrationWarning>
                                        {new Date(p.created_at).toLocaleString()}
                                    </span>
                                </span>
                                <span className="text-right tabular-nums">
                                    <span className="block font-bold">{formatCoins(p.coins + p.bonus_coins, 0)} coins</span>
                                    <span className="text-xs text-dim">{money(p.amount, p.currency_symbol || activeCurrency.symbol)}</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

function Row({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-dim">{label}</dt>
            <dd className={cn('font-semibold tabular-nums', big && 'text-lg font-extrabold text-white', accent && 'text-lime')}>{value}</dd>
        </div>
    );
}

export function StatusIcon({ status }: { status: string }) {
    if (status === 'paid') return <CheckCircle2 className="size-5 text-lime" />;
    if (status === 'failed') return <XCircle className="size-5 text-red-400" />;
    return <Clock className="size-5 text-amber-300" />;
}
