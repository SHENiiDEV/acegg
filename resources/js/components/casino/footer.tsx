import { Link, usePage } from '@inertiajs/react';
import { Instagram, Lock, MessageCircle, Twitter, Youtube } from 'lucide-react';

const LOGO_ALT: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', 'pci-dss': 'PCI DSS compliant' };
import { Logo } from '@/components/casino/art';

const COLUMNS: { title: string; links: [string, string][] }[] = [
    {
        title: 'Platform',
        links: [
            ['Casino', '/games'],
            ['VIP Club', '/vip'],
            ['Lottery', '/lottery'],
            ['Bonuses', '/bonuses'],
            ['New games', '/games?filter=new'],
        ],
    },
    {
        title: 'Legal',
        links: [
            ['Terms & Conditions', '/legal/terms'],
            ['Privacy Policy', '/legal/privacy'],
            ['Cookie Policy', '/legal/cookies'],
            ['Payments & Refunds', '/legal/payments-refunds'],
            ['KYC & AML Policy', '/legal/kyc-aml'],
            ['Social Casino Rules', '/legal/social-casino-rules'],
            ['Responsible Gaming', '/legal/responsible-gaming'],
        ],
    },
];

export function CasinoFooter() {
    const { company, name, casino } = usePage().props;
    const year = new Date().getFullYear();

    return (
        <footer className="mt-12 border-t border-line/60 bg-panel">
            <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-8 md:flex-row md:gap-8 md:px-6 md:py-10">
                <div className="md:w-56">
                    <Logo />
                    <p className="mt-3 text-xs leading-relaxed text-dim">
                        Social casino for entertainment. No real-money gambling — coins have no cash value and cannot be
                        withdrawn.
                    </p>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
                    {COLUMNS.map((c) => (
                        <div key={c.title} className={c.title === 'Platform' ? 'hidden sm:block' : undefined}>
                            <div className="mb-3 text-xs font-bold tracking-wider text-white uppercase">{c.title}</div>
                            <ul className="flex flex-col gap-2">
                                {c.links.map(([label, href]) => (
                                    <li key={href}>
                                        <Link href={href} className="text-sm text-dim transition hover:text-white">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div>
                        <div className="mb-3 text-xs font-bold tracking-wider text-white uppercase">Support</div>
                        <ul className="flex flex-col gap-2 text-sm text-dim">
                            <li>
                                <a href={`mailto:${company.email}`} className="hover:text-white">
                                    {company.email}
                                </a>
                            </li>
                            <li>
                                <Link href="/legal/responsible-gaming" className="hover:text-white">
                                    Responsible Gaming
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="flex gap-2">
                    {[Instagram, Twitter, MessageCircle, Youtube].map((Icon, i) => (
                        <span key={i} className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-dim">
                            <Icon className="size-4" />
                        </span>
                    ))}
                </div>
            </div>
            {(casino.payment_logos ?? []).length > 0 && (
                <div className="border-t border-line/60">
                    <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-5 md:px-6">
                        <span className="mr-2 text-xs font-bold tracking-wider text-dim uppercase">Secure payments</span>
                        {casino.payment_logos.map((logo) => (
                            <span key={logo} className="flex h-12 items-center rounded-lg bg-white px-4">
                                <img src={`/images/payments/${logo}.png`} alt={LOGO_ALT[logo] ?? logo} className="h-8 w-auto object-contain" loading="lazy" />
                            </span>
                        ))}
                        <span className="ml-auto flex items-center gap-1.5 text-xs text-dim">
                            <Lock className="size-3.5" /> 256-bit SSL encryption
                        </span>
                    </div>
                </div>
            )}
            <div className="border-t border-line/60">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-5 text-xs leading-relaxed text-dim md:px-6">
                    <p>
                        {name} is a social casino operated by {company.name} (company number {company.number}),
                        registered address: {company.address}. Virtual coins have no monetary value and cannot be
                        exchanged for cash or prizes.
                        <br />© {year} {name}. All rights reserved.
                    </p>
                    <span className="shrink-0 rounded-md bg-surface-2 px-2 py-1 font-bold text-white">18+</span>
                </div>
            </div>
        </footer>
    );
}
