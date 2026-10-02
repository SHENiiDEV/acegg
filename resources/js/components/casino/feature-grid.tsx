import { Gift, Headphones, ShieldCheck, Sparkles, Ticket, Trophy, Zap } from 'lucide-react';
import { IconBadge } from '@/components/casino/icon-badge';
import type { Tone } from '@/components/casino/icon-badge';
import { cn } from '@/lib/utils';

const FEATURES: { title: string; text: string; icon: typeof Zap; tone: Tone; bg: string }[] = [
    { title: 'Instant Coins', text: 'Purchased and bonus coins land in your balance immediately.', icon: Zap, tone: 'sky', bg: 'from-[#1a3f86] to-[#1b2029]' },
    { title: 'Top-Level Security', text: 'Two-factor authentication, passkeys and encrypted connections.', icon: ShieldCheck, tone: 'amber', bg: 'from-[#6a3410] to-[#1b2029]' },
    { title: 'Welcome Bonuses', text: 'Generous coin bonuses for both new and existing players.', icon: Gift, tone: 'lime', bg: 'from-[#2c5a0a] to-[#1b2029]' },
    { title: 'Exclusive Rewards', text: 'Level up in the VIP Club for cashback and level-up rewards.', icon: Trophy, tone: 'rose', bg: 'from-[#661a2b] to-[#1b2029]' },
    { title: 'Provably Fair Lottery', text: 'Hourly draws with a published seed hash you can verify.', icon: Ticket, tone: 'violet', bg: 'from-[#4a1a66] to-[#1b2029]' },
    { title: '24/7 Support', text: 'Our support team is here whenever you need a hand.', icon: Headphones, tone: 'sky', bg: 'from-[#173a66] to-[#1b2029]' },
];

export function FeatureGrid({ title = 'Secure, Fast & Rewarding' }: { title?: string }) {
    return (
        <section className="mt-12">
            <div className="text-center">
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="mt-1 text-sm text-dim">Everything you need for a secure, rewarding and seamless experience</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {FEATURES.map((f) => (
                    <div
                        key={f.title}
                        className={cn('relative flex min-h-[132px] items-center overflow-hidden rounded-2xl bg-gradient-to-r p-5 ring-1 ring-line/60', f.bg)}
                    >
                        <div className="bg-suits absolute inset-0 opacity-60" />
                        <div className="relative max-w-[62%]">
                            <div className="text-lg font-bold">{f.title}</div>
                            <p className="mt-1 text-sm leading-snug text-white/70">{f.text}</p>
                        </div>
                        <IconBadge icon={f.icon} tone={f.tone} className="absolute right-5 size-20 rotate-6 rounded-[26px]" iconClassName="size-10" />
                        <Sparkles className="absolute top-4 right-28 size-4 text-white/40" />
                    </div>
                ))}
            </div>
        </section>
    );
}
