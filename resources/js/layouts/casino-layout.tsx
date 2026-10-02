import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CasinoFooter } from '@/components/casino/footer';
import { CasinoHeader } from '@/components/casino/header';
import { MobileNav } from '@/components/casino/mobile-nav';
import { CasinoSidebar } from '@/components/casino/sidebar';
import { cn } from '@/lib/utils';
import { useFlashToast } from '@/hooks/use-flash-toast';

export default function CasinoLayout({ children }: { children: ReactNode }) {
    useFlashToast();
    const { url, props } = usePage();
    const isPlay = url.startsWith('/play/');
    // null = default for the breakpoint (open on desktop, closed on mobile) — same markup on server and client.
    const [sidebarOpen, setSidebarOpen] = useState<boolean | null>(null);
    const [liveBalance, setLiveBalance] = useState<number | null>(null);

    // While a game is open the coins sit in SpinKit — poll the live balance.
    useEffect(() => {
        if (!isPlay || !props.auth.user) {
            setLiveBalance(null);
            return;
        }
        let stop = false;
        const tick = () =>
            fetch('/wallet/balance', { headers: { Accept: 'application/json' } })
                .then((r) => r.json())
                .then((d: { balance: number }) => !stop && setLiveBalance(d.balance))
                .catch(() => undefined);
        void tick();
        const t = setInterval(tick, 4000);
        return () => {
            stop = true;
            clearInterval(t);
        };
    }, [isPlay, props.auth.user]);

    // Close the phone drawer after every navigation and lock page scroll while it is open.
    useEffect(() => router.on('navigate', () => setSidebarOpen((v) => (v === true && window.innerWidth < 1024 ? null : v))), []);
    useEffect(() => {
        const lock = sidebarOpen === true && window.innerWidth < 1024;
        document.documentElement.style.overflow = lock ? 'hidden' : '';
        return () => {
            document.documentElement.style.overflow = '';
        };
    }, [sidebarOpen]);

    const closeOnMobile = () => {
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    return (
        <div className="min-h-svh bg-page text-white">
            <CasinoHeader
                onToggleSidebar={() => setSidebarOpen((v) => !(v ?? window.innerWidth >= 1024))}
                liveBalance={liveBalance}
            />
            <div className="flex">
                <CasinoSidebar open={sidebarOpen} onNavigate={closeOnMobile} />
                <div
                    className={cn(
                        'fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
                        sidebarOpen === true ? 'opacity-100' : 'pointer-events-none opacity-0',
                    )}
                    onClick={() => setSidebarOpen(false)}
                />
                <div className={cn('min-w-0 flex-1', !isPlay && 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0')}>
                    <main className={cn('bg-suits mx-auto max-w-[1440px] overflow-x-clip md:px-6', isPlay ? 'px-0 py-0 md:py-5' : 'px-3 py-4 md:py-5')}>
                        {children}
                    </main>
                    {!isPlay && <CasinoFooter />}
                    {isPlay && (
                        <div className="hidden lg:block">
                            <CasinoFooter />
                        </div>
                    )}
                </div>
            </div>
            {!isPlay && <MobileNav onMenu={() => setSidebarOpen(true)} />}
        </div>
    );
}
