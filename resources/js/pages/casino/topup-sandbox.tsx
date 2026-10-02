import { Head, router } from '@inertiajs/react';
import { CreditCard, FlaskConical, Lock } from 'lucide-react';
import { CoinIcon } from '@/components/casino/art';
import { formatCoins } from '@/lib/casino';

type Payment = { id: string; package: string | null; amount: number; currency: string; coins: number; bonus_coins: number };

/** Development-only checkout. Replaced by the real provider's payment page in production. */
export default function TopupSandbox({ payment, approveUrl }: { payment: Payment; approveUrl: string }) {
    const decide = (decision: 'approve' | 'decline') => router.post(approveUrl, { decision });

    return (
        <>
            <Head title="Test checkout" />
            <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-2xl bg-surface ring-1 ring-line/60">
                <div className="flex items-center gap-2 bg-amber-500/15 px-5 py-3 text-sm font-semibold text-amber-200">
                    <FlaskConical className="size-4" /> Sandbox checkout — no real payment
                </div>
                <div className="p-6">
                    <div className="text-xs text-dim">Order #{payment.id.slice(0, 8).toUpperCase()}</div>
                    <div className="mt-1 text-3xl font-extrabold">
                        {payment.currency} {(payment.amount / 100).toFixed(2)}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                        <CoinIcon className="size-4" /> {formatCoins(payment.coins + payment.bonus_coins, 0)} coins
                    </div>
                    <div className="mt-5 flex items-center gap-3 rounded-xl bg-surface-2/70 p-4 text-sm">
                        <CreditCard className="size-5 text-dim" />
                        <span className="font-mono tracking-wider">4242 4242 4242 4242</span>
                        <span className="ml-auto text-dim">12/34</span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => decide('decline')} className="rounded-xl bg-surface-2 py-3 text-sm font-semibold hover:bg-line">
                            Decline
                        </button>
                        <button type="button" onClick={() => decide('approve')} className="flex items-center justify-center gap-2 rounded-xl bg-lime py-3 text-sm font-bold text-lime-ink">
                            <Lock className="size-4" /> Approve payment
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
