import { Link, usePage } from '@inertiajs/react';
import { Crown, Dices, Menu, Plus, Ticket, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * App-style bottom tab bar for phones (hidden from lg up).
 * Centre button: Top up (or Join for guests).
 */
export function MobileNav({ onMenu }: { onMenu: () => void }) {
    const { url, props } = usePage();
    const path = url.split('?')[0];
    const loggedIn = Boolean(props.auth.user);
    const active = (p: string) => (p === '/' ? path === '/' : path.startsWith(p));

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 border-t border-white/5 bg-panel/85 backdrop-blur-xl lg:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Main"
        >
            <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-end px-2">
                <TabButton label="Menu" icon={Menu} onClick={onMenu} />
                <TabLink href="/games" label="Casino" icon={Dices} active={active('/games') || path === '/'} />

                <div className="flex justify-center">
                    <Link
                        href={loggedIn ? '/topup' : '/register'}
                        className={cn(
                            '-mt-6 mb-2 flex size-14 flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#e2ff6e] to-[#a6e01c] text-lime-ink shadow-[0_10px_30px_-6px_rgba(201,247,58,.75)] ring-4 ring-page transition active:scale-95',
                            active('/topup') && 'ring-lime/30',
                        )}
                        aria-label={loggedIn ? 'Top up' : 'Join'}
                    >
                        {loggedIn ? <Plus className="size-6" strokeWidth={3} /> : <UserPlus className="size-5" strokeWidth={2.6} />}
                        <span className="text-[9px] leading-none font-extrabold uppercase">{loggedIn ? 'Top up' : 'Join'}</span>
                    </Link>
                </div>

                <TabLink href="/lottery" label="Lottery" icon={Ticket} active={active('/lottery')} />
                <TabLink href="/vip" label="VIP" icon={Crown} active={active('/vip')} />
            </div>
        </nav>
    );
}

function TabLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Menu; active: boolean }) {
    return (
        <Link href={href} className="group flex h-16 flex-col items-center justify-center gap-1 transition active:scale-95">
            <Icon className={cn('size-5.5 transition', active ? 'text-lime' : 'text-dim group-hover:text-white')} strokeWidth={active ? 2.5 : 2} />
            <span className={cn('text-[10px] font-semibold', active ? 'text-white' : 'text-dim')}>{label}</span>
            <span className={cn('h-1 w-5 rounded-full transition', active ? 'bg-lime' : 'bg-transparent')} />
        </Link>
    );
}

function TabButton({ label, icon: Icon, onClick }: { label: string; icon: typeof Menu; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="group flex h-16 flex-col items-center justify-center gap-1 transition active:scale-95">
            <Icon className="size-5.5 text-dim group-hover:text-white" />
            <span className="text-[10px] font-semibold text-dim">{label}</span>
            <span className="h-1 w-5" />
        </button>
    );
}
