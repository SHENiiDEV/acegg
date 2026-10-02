import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Dices,
    Gift,
    LogOut,
    Menu,
    Plus,
    Settings,
    Ticket,
    Crown,
    Wallet,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CoinIcon, Logo } from '@/components/casino/art';
import { NotificationBell } from '@/components/casino/notification-bell';
import { formatCoins, formatCoinsShort } from '@/lib/casino';
import { cn } from '@/lib/utils';

type Props = {
    onToggleSidebar: () => void;
    liveBalance?: number | null;
};

const TOP_NAV = [
    { href: '/', label: 'Casino', icon: Dices, match: (p: string) => p === '/' || p.startsWith('/games') || p.startsWith('/play') },
    { href: '/vip', label: 'VIP Club', icon: Crown, match: (p: string) => p.startsWith('/vip') },
    { href: '/lottery', label: 'Lottery', icon: Ticket, match: (p: string) => p.startsWith('/lottery') },
];

export function CasinoHeader({ onToggleSidebar, liveBalance }: Props) {
    const { auth, wallet } = usePage().props;
    const path = usePage().url.split('?')[0];
    const user = auth.user;
    const balance = liveBalance ?? wallet?.balance ?? 0;

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line/60 bg-panel/90 px-3 backdrop-blur-xl sm:gap-3 md:px-4 lg:h-16">
            <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden size-9 items-center justify-center rounded-lg bg-surface-2 text-dim transition hover:text-white lg:flex"
                aria-label="Toggle menu"
            >
                <Menu className="size-4.5" />
            </button>
            <Link href="/" className="shrink-0">
                <Logo textClassName="hidden min-[420px]:inline" />
            </Link>

            <nav className="ml-4 hidden items-center gap-1 rounded-xl bg-surface-2 p-1 md:flex">
                {TOP_NAV.map((item) => {
                    const active = item.match(path);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition',
                                active ? 'bg-lime font-semibold text-lime-ink' : 'font-medium text-dim hover:text-white',
                            )}
                        >
                            <item.icon className="size-4" /> {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="flex min-w-0 flex-1 justify-end lg:justify-center">
                {user && (
                    <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1">
                        <Link href="/settings/wallet" className="flex items-center gap-1.5 px-2 text-sm font-bold text-white tabular-nums sm:gap-2 sm:px-2.5">
                            <CoinIcon className="size-5 shrink-0" />
                            <span className="sm:hidden">{formatCoinsShort(balance)}</span>
                            <span className="hidden sm:inline">{formatCoins(balance)}</span>
                            {wallet?.in_game && (
                                <span className="hidden rounded bg-sky/20 px-1.5 text-[10px] font-bold text-sky uppercase sm:inline">
                                    in game
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/topup"
                            className="flex items-center gap-1.5 rounded-lg bg-lime px-3 py-1.5 text-sm font-semibold text-lime-ink transition hover:brightness-110"
                        >
                            <Plus className="size-4 sm:hidden" strokeWidth={3} />
                            <Wallet className="hidden size-4 sm:block" />
                            <span className="hidden sm:inline">Top up</span>
                        </Link>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {user ? (
                    <>
                        <IconButton label="Bonuses" active={wallet?.daily_bonus_available} onClick={() => router.visit('/bonuses')} className="hidden sm:flex">
                            <Gift className="size-4.5" />
                        </IconButton>
                        <NotificationBell />
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl bg-surface-2 p-1 text-sm font-medium text-white outline-none sm:pr-2">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffb36b] to-[#e8335e] text-xs font-bold">
                                    {user.name.slice(0, 1).toUpperCase()}
                                </span>
                                <span className="hidden max-w-24 truncate sm:inline">{user.name}</span>
                                <ChevronDown className="hidden size-3.5 text-dim sm:block" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 border-line bg-surface">
                                <DropdownMenuLabel className="text-xs text-dim">
                                    {user.email}
                                    {wallet?.vip_level && (
                                        <span className="mt-1 flex items-center gap-1 font-semibold" style={{ color: wallet.vip_level.color }}>
                                            <Crown className="size-3.5" /> {wallet.vip_level.name} VIP
                                        </span>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/vip" className="cursor-pointer">
                                        <Crown className="mr-2" /> VIP Club
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/topup" className="cursor-pointer">
                                        <Wallet className="mr-2" /> Top up
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/bonuses" className="cursor-pointer">
                                        <Gift className="mr-2" /> Bonuses
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile" className="cursor-pointer">
                                        <Settings className="mr-2" /> Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full cursor-pointer"
                                        onClick={() => router.flushAll()}
                                    >
                                        <LogOut className="mr-2" /> Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-line sm:px-3.5"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-lg bg-lime px-3 py-2 text-sm font-semibold whitespace-nowrap text-lime-ink transition hover:brightness-110 sm:px-3.5"
                        >
                            Registration
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}

function IconButton({
    children,
    label,
    onClick,
    pressed,
    active,
    className,
}: {
    children: React.ReactNode;
    label: string;
    onClick?: () => void;
    pressed?: boolean;
    active?: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
            className={cn(
                'relative flex size-9 items-center justify-center rounded-xl bg-surface-2 text-dim transition hover:text-white',
                pressed && 'bg-sky text-white hover:text-white',
                className,
            )}
        >
            {children}
            {active && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-lime ring-2 ring-surface-2" />}
        </button>
    );
}
