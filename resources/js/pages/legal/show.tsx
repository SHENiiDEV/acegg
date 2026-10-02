import { Head, Link, usePage } from '@inertiajs/react';
import { FileText, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatCoins } from '@/lib/casino';
import { cn } from '@/lib/utils';
import type { Company } from '@/types';

type Props = {
    page: string;
    title: string;
    pages: Record<string, string>;
    updatedAt: string;
    restrictedCountries: string[];
    lottery: { ticket_price: number; pick: number; max_number: number };
};

type Ctx = {
    c: Company;
    brand: string;
    coins: string;
    restricted: string[];
    lottery: Props['lottery'];
    welcome: number;
    daily: number;
};
type Section = { id: string; title: string; body: ReactNode };

/**
 * Template legal texts for a social casino. Operator details come from .env (COMPANY_*).
 * IMPORTANT: have a qualified lawyer review these texts for your jurisdiction before launch.
 */
export default function LegalShow({ page, title, pages, updatedAt, restrictedCountries, lottery }: Props) {
    const { company, name, casino } = usePage().props;
    const sections =
        CONTENT[page]?.({
            c: company,
            brand: name,
            coins: casino.currency,
            restricted: restrictedCountries,
            lottery,
            welcome: casino.welcome_bonus,
            daily: casino.daily_bonus,
        }) ?? [];

    return (
        <>
            <Head title={title} />
            <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
                <nav className="scrollbar-none flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:self-start">
                    {Object.entries(pages).map(([slug, label]) => (
                        <Link
                            key={slug}
                            href={`/legal/${slug}`}
                            className={cn(
                                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                                slug === page ? 'bg-surface-2 text-white ring-1 ring-line' : 'text-dim hover:text-white',
                            )}
                        >
                            <FileText className={cn('size-4', slug === page && 'text-lime')} /> {label}
                        </Link>
                    ))}
                </nav>

                <article className="min-w-0 rounded-2xl bg-surface p-6 ring-1 ring-line/60 md:p-10">
                    <div className="border-b border-line/60 pb-6">
                        <div className="text-xs font-bold tracking-wider text-lime uppercase">Legal</div>
                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{title}</h1>
                        <p className="mt-1 text-xs text-dim">
                            Last updated: {updatedAt} · {company.name}
                        </p>
                    </div>

                    {sections.length > 1 && (
                        <div className="mt-6 rounded-xl bg-surface-2/60 p-4">
                            <div className="mb-2 text-xs font-bold tracking-wider text-dim uppercase">Contents</div>
                            <ol className="grid gap-1 text-sm sm:grid-cols-2">
                                {sections.map((s, i) => (
                                    <li key={s.id}>
                                        <a href={`#${s.id}`} className="text-white/80 hover:text-lime">
                                            {i + 1}. {s.title}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    <div className="mt-6 space-y-8 text-[15px] leading-relaxed text-white/80 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-1.5 [&_b]:text-white">
                        {sections.map((s, i) => (
                            <section key={s.id} id={s.id} className="scroll-mt-24">
                                <h2 className="text-lg font-bold text-white">
                                    <span className="mr-2 text-lime">{i + 1}.</span>
                                    {s.title}
                                </h2>
                                {s.body}
                            </section>
                        ))}
                    </div>

                    <OperatorCard c={company} />
                </article>
            </div>
        </>
    );
}

function OperatorCard({ c }: { c: Company }) {
    return (
        <div className="mt-10 grid gap-4 rounded-xl bg-surface-2 p-5 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
            <dl className="grid grid-cols-[120px_1fr] gap-y-1">
                <dt className="text-dim">Operator</dt>
                <dd className="text-white">{c.name}</dd>
                <dt className="text-dim">Company no.</dt>
                <dd className="text-white">{c.number}</dd>
                <dt className="text-dim">Address</dt>
                <dd className="text-white">{c.address}</dd>
            </dl>
            <a href={`mailto:${c.email}`} className="flex items-center gap-2 rounded-xl bg-lime px-4 py-2.5 font-bold text-lime-ink">
                <Mail className="size-4" /> {c.email}
            </a>
        </div>
    );
}

const L = ({ href, children }: { href: string; children: ReactNode }) => (
    <Link href={href} className="font-semibold text-lime hover:underline">
        {children}
    </Link>
);

const law = (c: Company) => c.jurisdiction ?? 'the country in which the Company is registered';

const CONTENT: Record<string, (x: Ctx) => Section[]> = {
    terms: ({ c, brand, coins, restricted }) => [
        {
            id: 'introduction',
            title: 'Introduction',
            body: (
                <>
                    <p>
                        These Terms & Conditions (the “Terms”) form a binding agreement between you and <b>{c.name}</b>, company number {c.number},
                        registered at {c.address} (the “Company”, “we”, “us”), which operates {brand} (the “Service”).
                    </p>
                    <p>
                        By registering, ticking the acceptance box or using the Service you confirm that you have read and agree to these Terms, our{' '}
                        <L href="/legal/privacy">Privacy Policy</L>, <L href="/legal/payments-refunds">Payments & Refunds</L> policy and{' '}
                        <L href="/legal/social-casino-rules">Social Casino Rules</L>. If you do not agree, do not use the Service.
                    </p>
                </>
            ),
        },
        {
            id: 'nature',
            title: 'Nature of the Service',
            body: (
                <ul>
                    <li>{brand} is a social casino for entertainment purposes only. It does not offer real-money gambling.</li>
                    <li>Games are played with virtual {coins} which have no monetary value and can never be withdrawn, exchanged for cash, cashed out or redeemed for prizes of monetary value.</li>
                    <li>Success in social casino games does not imply future success in real-money gambling.</li>
                </ul>
            ),
        },
        {
            id: 'eligibility',
            title: 'Eligibility',
            body: (
                <ul>
                    <li>You must be at least 18 years old, or the age of legal majority in your place of residence if higher.</li>
                    <li>You must provide true, accurate and complete registration details and keep them up to date.</li>
                    <li>You may hold only one account. Accounts are personal and non-transferable.</li>
                    <li>You must not use the Service where doing so is prohibited by local law. You are responsible for checking this.</li>
                </ul>
            ),
        },
        {
            id: 'restricted',
            title: 'Restricted territories',
            body: (
                <>
                    <p>For sanctions and compliance reasons we do not accept players who reside in, or access the Service from, the following countries:</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {restricted.map((r) => (
                            <span key={r} className="rounded-md bg-surface-2 px-2 py-1 text-xs text-white/80 ring-1 ring-line">
                                {r}
                            </span>
                        ))}
                    </div>
                    <p>We may add territories at any time. Accounts opened in breach of this section will be closed.</p>
                </>
            ),
        },
        {
            id: 'account',
            title: 'Your account and security',
            body: (
                <ul>
                    <li>Keep your password confidential. We recommend enabling two-factor authentication or a passkey in Settings → Security.</li>
                    <li>You are responsible for all activity under your account.</li>
                    <li>We may request identity verification at any time (see <L href="/legal/kyc-aml">KYC & AML Policy</L>).</li>
                    <li>You can close your account at any time from Settings → Profile. Remaining {coins} are forfeited on closure.</li>
                </ul>
            ),
        },
        {
            id: 'coins',
            title: `Virtual ${coins}`,
            body: (
                <ul>
                    <li>{coins} are a limited, revocable licence to use a feature of the Service; they are not your property.</li>
                    <li>{coins} may be obtained free of charge (welcome bonus, daily bonus, VIP rewards, promotions) or purchased.</li>
                    <li>{coins} cannot be transferred between accounts, sold, or exchanged outside the Service.</li>
                    <li>We may correct balances resulting from errors, malfunctions or abuse.</li>
                </ul>
            ),
        },
        {
            id: 'purchases',
            title: 'Purchases',
            body: (
                <p>
                    Optional purchases of {coins} are processed by our third-party payment providers. Prices are shown before payment, include applicable
                    taxes unless stated otherwise, and are final once {coins} are delivered — see <L href="/legal/payments-refunds">Payments & Refunds</L>.
                </p>
            ),
        },
        {
            id: 'promotions',
            title: 'Bonuses, VIP Club and lottery',
            body: (
                <ul>
                    <li>Bonuses, VIP rewards, cashback and lottery prizes are paid in {coins} only and are subject to the rules shown on the respective page.</li>
                    <li>We may change, suspend or end any promotion, VIP level or the lottery with reasonable notice.</li>
                    <li>Abuse (multiple accounts, collusion, automation, exploiting errors) leads to forfeiture of rewards and account closure.</li>
                </ul>
            ),
        },
        {
            id: 'fair-play',
            title: 'Fair play and RNG',
            body: (
                <p>
                    Game outcomes are generated server-side by a random number generator operated by our game provider. Lottery draws are provably fair: the
                    seed hash is published before each draw and the seed is revealed afterwards so anyone can verify the result.
                </p>
            ),
        },
        {
            id: 'conduct',
            title: 'Prohibited conduct',
            body: (
                <ul>
                    <li>Using bots, scripts, VPNs or any means to hide your location or automate play.</li>
                    <li>Harassment, hate speech, spam or sharing personal data in chat.</li>
                    <li>Attempting to hack, reverse-engineer or disrupt the Service.</li>
                    <li>Using the Service for any unlawful purpose, including money laundering.</li>
                </ul>
            ),
        },
        {
            id: 'suspension',
            title: 'Suspension and termination',
            body: <p>We may suspend or close accounts that breach these Terms, with or without notice. Where closure results from a breach, {coins} and pending rewards are forfeited.</p>,
        },
        {
            id: 'liability',
            title: 'Limitation of liability',
            body: (
                <p>
                    The Service is provided “as is”. To the extent permitted by law, the Company is not liable for indirect or consequential losses, loss of{' '}
                    {coins}, or interruptions caused by maintenance or events beyond our control. Nothing limits liability that cannot be limited by law.
                </p>
            ),
        },
        {
            id: 'law',
            title: 'Governing law and complaints',
            body: (
                <p>
                    These Terms are governed by the laws of {law(c)}. Complaints should first be sent to {c.email}; we aim to reply within 14 days.
                    Consumers keep any mandatory rights under the law of their country of residence.
                </p>
            ),
        },
        {
            id: 'changes',
            title: 'Changes to these Terms',
            body: <p>We may update these Terms. Material changes will be notified on the Service or by email; continuing to use the Service means you accept them.</p>,
        },
    ],

    privacy: ({ c, brand }) => [
        {
            id: 'controller',
            title: 'Who we are',
            body: (
                <p>
                    {c.name} ({c.number}, {c.address}) is the data controller for personal data processed through {brand}. Contact: {c.email}.
                </p>
            ),
        },
        {
            id: 'data',
            title: 'Data we collect',
            body: (
                <ul>
                    <li><b>Registration data:</b> name, surname, email, phone number, date of birth, address (street, city, post code, country).</li>
                    <li><b>Account data:</b> password hash, security settings (2FA, passkeys), preferences.</li>
                    <li><b>Gameplay data:</b> game rounds, coin balance and transactions, VIP progress, lottery tickets.</li>
                    <li><b>Payment data:</b> purchase history. Card details are processed by our payment provider and never stored by us.</li>
                    <li><b>Verification data:</b> identity documents and proof of address when requested for KYC.</li>
                    <li><b>Technical data:</b> IP address, device and browser information, cookies, logs.</li>
                </ul>
            ),
        },
        {
            id: 'purposes',
            title: 'Why we use it and legal bases',
            body: (
                <ul>
                    <li>To create and run your account and provide games — performance of contract.</li>
                    <li>To process payments, prevent fraud and meet AML / sanctions obligations — legal obligation and legitimate interests.</li>
                    <li>To verify age and identity — legal obligation.</li>
                    <li>To improve the Service and keep it secure — legitimate interests.</li>
                    <li>To send marketing — only with your consent, which you can withdraw at any time.</li>
                </ul>
            ),
        },
        {
            id: 'sharing',
            title: 'Who we share it with',
            body: (
                <ul>
                    <li>Payment service providers and card schemes, to process purchases.</li>
                    <li>Our game server provider, which receives a pseudonymous player ID only.</li>
                    <li>Identity verification and fraud prevention providers.</li>
                    <li>Hosting, email and support tools acting as our processors.</li>
                    <li>Authorities, where required by law.</li>
                </ul>
            ),
        },
        {
            id: 'transfers',
            title: 'International transfers',
            body: <p>Where data leaves the EEA/UK we use adequacy decisions or standard contractual clauses to protect it.</p>,
        },
        {
            id: 'retention',
            title: 'How long we keep it',
            body: <p>Account and transaction data are kept while your account is open and for up to 5 years after closure to meet legal and AML obligations, then deleted or anonymised.</p>,
        },
        {
            id: 'rights',
            title: 'Your rights',
            body: (
                <>
                    <ul>
                        <li>Access, correct or delete your data; restrict or object to processing; data portability.</li>
                        <li>Withdraw consent at any time; lodge a complaint with your data protection authority.</li>
                    </ul>
                    <p>Write to {c.email} — we reply within one month.</p>
                </>
            ),
        },
        {
            id: 'security',
            title: 'Security',
            body: <p>We use TLS encryption, hashed passwords, optional 2FA and passkeys, and access controls. No system is 100% secure — please use a strong, unique password.</p>,
        },
        {
            id: 'cookies',
            title: 'Cookies',
            body: (
                <p>
                    See our <L href="/legal/cookies">Cookie Policy</L>.
                </p>
            ),
        },
    ],

    cookies: ({ brand }) => [
        {
            id: 'what',
            title: 'What cookies are',
            body: <p>Cookies are small files stored by your browser. {brand} uses them to keep you signed in and secure.</p>,
        },
        {
            id: 'which',
            title: 'Cookies we use',
            body: (
                <ul>
                    <li><b>Session cookie</b> — keeps you logged in (strictly necessary).</li>
                    <li><b>XSRF-TOKEN</b> — protects forms against cross-site request forgery (strictly necessary).</li>
                    <li><b>remember_web</b> — remembers your login if you tick “Remember me”.</li>
                    <li><b>sidebar_state</b> — remembers interface preferences.</li>
                    <li>Game iframes from our game provider may set their own technical cookies.</li>
                </ul>
            ),
        },
        {
            id: 'control',
            title: 'Managing cookies',
            body: <p>You can block or delete cookies in your browser settings, but the Service will not work without strictly necessary cookies.</p>,
        },
    ],

    'payments-refunds': ({ c, coins }) => [
        {
            id: 'purchases',
            title: 'Buying coins',
            body: (
                <ul>
                    <li>Purchases are optional; {coins} can also be obtained for free.</li>
                    <li>Payments are processed by licensed payment providers. We accept Visa and Mastercard; card data is handled in line with PCI DSS by our provider.</li>
                    <li>Your registered name, address, date of birth and phone number must match the card holder’s details — payments may be declined otherwise.</li>
                    <li>Purchased {coins} are credited to your balance immediately after the payment is confirmed.</li>
                </ul>
            ),
        },
        {
            id: 'no-cashout',
            title: 'No cash-out',
            body: <p>{coins} have no cash value and cannot be withdrawn, refunded to a card, or exchanged for money or prizes.</p>,
        },
        {
            id: 'refunds',
            title: 'Refunds',
            body: (
                <ul>
                    <li>Because {coins} are delivered instantly, you agree that you lose the right of withdrawal once delivery starts, where the law allows.</li>
                    <li>If you were charged but {coins} were not delivered, or you were charged twice, contact {c.email} within 30 days and we will credit or refund you.</li>
                    <li>Unauthorised payments: contact us immediately; we will investigate and cooperate with your bank.</li>
                </ul>
            ),
        },
        {
            id: 'chargebacks',
            title: 'Chargebacks',
            body: <p>Please contact us before opening a chargeback. Accounts with chargebacks may be suspended until the dispute is resolved.</p>,
        },
    ],

    'kyc-aml': ({ c, brand, restricted }) => [
        {
            id: 'why',
            title: 'Why we verify players',
            body: <p>To protect players, prevent fraud and comply with anti-money-laundering and sanctions rules, {brand} verifies the identity and age of its customers.</p>,
        },
        {
            id: 'what',
            title: 'What we may ask for',
            body: (
                <ul>
                    <li>A valid passport, national ID card or driving licence.</li>
                    <li>Proof of address not older than 3 months (utility bill or bank statement).</li>
                    <li>Proof of payment method ownership (e.g. a photo of the card with middle digits hidden).</li>
                </ul>
            ),
        },
        {
            id: 'when',
            title: 'When verification happens',
            body: <p>At registration we check age and country. Further documents may be requested before or after purchases, on unusual activity, or periodically.</p>,
        },
        {
            id: 'sanctions',
            title: 'Sanctions screening',
            body: (
                <p>
                    We screen customers against international sanctions and PEP lists. Players from {restricted.length} restricted countries are not accepted
                    (see <L href="/legal/terms#restricted">Terms</L>).
                </p>
            ),
        },
        {
            id: 'reporting',
            title: 'Suspicious activity',
            body: <p>We may suspend accounts and report suspicious activity to the competent authorities as required by law. Questions: {c.email}.</p>,
        },
    ],

    'social-casino-rules': ({ brand, coins, lottery, welcome, daily }) => [
        {
            id: 'coins',
            title: `How ${coins} work`,
            body: (
                <ul>
                    <li>New accounts receive a one-time welcome bonus of {formatCoins(welcome, 0)} {coins}.</li>
                    <li>Free {coins} ({formatCoins(daily, 0)}) can be claimed once every 24 hours.</li>
                    <li>When you open a game, your {coins} move into the game; when you return to the lobby they move back with any winnings.</li>
                    <li>{coins} have no cash value and cannot be withdrawn.</li>
                </ul>
            ),
        },
        {
            id: 'vip',
            title: 'VIP Club',
            body: (
                <ul>
                    <li>You earn 1 XP for every coin wagered in games. XP unlocks VIP levels from Bronze to Diamond.</li>
                    <li>Each level raises your weekly cashback percentage and has a one-time level-up reward.</li>
                    <li>Cashback is calculated on net game losses since the last claim and can be claimed once every 7 days.</li>
                    <li>Daily and weekly missions give extra {coins} when completed.</li>
                </ul>
            ),
        },
        {
            id: 'lottery',
            title: 'Hourly lottery',
            body: (
                <ul>
                    <li>A draw takes place at the start of every hour.</li>
                    <li>
                        A ticket costs {formatCoins(lottery.ticket_price, 0)} {coins}; pick {lottery.pick} numbers from 1 to {lottery.max_number}.
                    </li>
                    <li>Prizes are shares of the pool split between winners in each tier; unwon shares roll over to the next draw.</li>
                    <li>Draws are provably fair — the seed hash is published in advance and the seed is revealed after the draw.</li>
                </ul>
            ),
        },
        {
            id: 'games',
            title: 'Games',
            body: <p>Every game shows its RTP and volatility. RTP is a long-term theoretical average and does not predict individual results on {brand}.</p>,
        },
    ],

    'responsible-gaming': ({ c, brand }) => [
        {
            id: 'commitment',
            title: 'Our commitment',
            body: <p>{brand} is designed for entertainment. Even without real money, gaming should stay fun and never take over your life.</p>,
        },
        {
            id: 'tips',
            title: 'Play safely',
            body: (
                <ul>
                    <li>Set a time limit before you start and take regular breaks.</li>
                    <li>Only spend on optional purchases what you can comfortably afford.</li>
                    <li>Do not play when stressed, upset or under the influence.</li>
                    <li>Never chase losses — they are part of the game.</li>
                </ul>
            ),
        },
        {
            id: 'signs',
            title: 'Warning signs',
            body: (
                <ul>
                    <li>Playing longer or spending more than intended.</li>
                    <li>Neglecting work, study, family or sleep.</li>
                    <li>Feeling anxious or irritable when not playing.</li>
                </ul>
            ),
        },
        {
            id: 'tools',
            title: 'Tools we offer',
            body: <p>On request we can apply a cooling-off period, self-exclusion (6 months to permanent) or close your account. Write to {c.email}.</p>,
        },
        {
            id: 'help',
            title: 'Where to get help',
            body: (
                <ul>
                    <li>GamCare — gamcare.org.uk</li>
                    <li>Gamblers Anonymous — gamblersanonymous.org</li>
                    <li>BeGambleAware — begambleaware.org</li>
                    <li>Gambling Therapy (international) — gamblingtherapy.org</li>
                </ul>
            ),
        },
        {
            id: 'minors',
            title: 'Protecting minors',
            body: <p>Accounts are for adults only (18+). We verify age at registration. Parents can use filtering software such as Net Nanny or Qustodio.</p>,
        },
    ],
};
