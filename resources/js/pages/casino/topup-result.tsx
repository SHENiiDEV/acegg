import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Clock, Wallet, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { CoinIcon } from '@/components/casino/art';
import { PageTitle } from '@/components/casino/page-title';
import { formatCoins } from '@/lib/casino';

type Payment = { id: string; package: string | null; amount: number; currency: string; coins: number; bonus_coins: number; status: string; failure_reason: string | null; paid_at: string | null };

export default function TopupResult({ payment }: { payment: Payment }) {
    // A real provider may confirm via webhook a few seconds later — poll while pending.
    useEffect(() => {
        if (payment.status !== 'pending') return;
        const t = setInterval(() => router.reload({ only: ['payment', 'wallet'] }), 3000);
        return () => clearInterval(t);
    }, [payment.status]);

    const total = payment.coins + payment.bonus_coins;
    const view =
        payment.status === 'paid'
            ? { icon: CheckCircle2, color: 'text-lime', title: 'Payment successful', text: `${formatCoins(total, 0)} coins were added to your balance. A receipt is on its way to your email.` }
            : payment.status === 'failed'
              ? { icon: XCircle, color: 'text-red-400', title: 'Payment failed', text: payment.failure_reason ?? 'The payment was not completed. You have not been charged.' }
              : { icon: Clock, color: 'text-amber-300', title: 'Waiting for confirmation', text: 'We are waiting for the payment provider. This page updates automatically.' };

    return (
        <>
            <Head title={view.title} />
            <PageTitle icon={Wallet} title="Top up" />
            <div className="mx-auto max-w-lg rounded-2xl bg-surface p-8 text-center ring-1 ring-line/60">
                <view.icon className={`mx-auto size-16 ${view.color}`} />
                <h1 className="mt-4 text-2xl font-extrabold">{view.title}</h1>
                <p className="mt-2 text-sm text-dim">{view.text}</p>
                <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-surface-2/60 py-4 text-3xl font-extrabold tabular-nums">
                    <CoinIcon className="size-8" /> {formatCoins(total, 0)}
                </div>
                <div className="mt-2 text-xs text-dim">
                    Order #{payment.id.slice(0, 8).toUpperCase()} · {payment.currency} {(payment.amount / 100).toFixed(2)}
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Link href="/games" className="rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink">
                        Play now
                    </Link>
                    {payment.status === 'paid' && (
                        <a
                            href={`/topup/${payment.id}/invoice`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl bg-surface-2 px-5 py-3 text-sm font-semibold hover:bg-line"
                        >
                            Download Invoice (PDF)
                        </a>
                    )}
                    <Link href="/topup" className="rounded-xl bg-surface-2 px-5 py-3 text-sm font-semibold hover:bg-line">
                        {payment.status === 'failed' ? 'Try again' : 'Buy more'}
                    </Link>
                </div>
            </div>
        </>
    );
}
