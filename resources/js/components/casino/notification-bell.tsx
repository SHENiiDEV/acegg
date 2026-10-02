import { Link, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, Crown, Gift, Ticket, Wallet } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Item = { id: string; kind: string; title: string; body: string; url: string | null; read: boolean; created_at: string };

const ICONS: Record<string, { icon: typeof Bell; tone: string }> = {
    topup: { icon: Wallet, tone: 'bg-lime/15 text-lime' },
    lottery_win: { icon: Ticket, tone: 'bg-violet-400/15 text-violet-300' },
    vip: { icon: Crown, tone: 'bg-amber-400/15 text-amber-300' },
    bonus: { icon: Gift, tone: 'bg-sky/15 text-sky' },
};

function csrf(): string {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

function ago(iso: string): string {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

/**
 * Bell with unread badge. Polls every 20s; when new notifications arrive
 * (deposit credited, lottery win…) it pops a toast.
 */
export function NotificationBell() {
    const { notifications } = usePage().props;
    const [unread, setUnread] = useState<number>(notifications?.unread ?? 0);
    const [items, setItems] = useState<Item[] | null>(null);
    const seen = useRef<Set<string> | null>(null);

    const load = useCallback(async (announce: boolean) => {
        try {
            const r = await fetch('/notifications', { headers: { Accept: 'application/json' } });
            if (!r.ok) return;
            const d = (await r.json()) as { unread: number; items: Item[] };
            if (announce && seen.current) {
                d.items.filter((i) => !i.read && !seen.current!.has(i.id)).slice(0, 3).forEach((i) => toast.success(i.title, { description: i.body }));
            }
            seen.current = new Set(d.items.map((i) => i.id));
            setItems(d.items);
            setUnread(d.unread);
        } catch {
            /* offline — try again on next tick */
        }
    }, []);

    useEffect(() => setUnread(notifications?.unread ?? 0), [notifications?.unread]);

    useEffect(() => {
        void load(false);
        const t = setInterval(() => void load(true), 20_000);
        return () => clearInterval(t);
    }, [load]);

    const markRead = async () => {
        if (unread === 0) return;
        setUnread(0);
        setItems((list) => list?.map((i) => ({ ...i, read: true })) ?? null);
        await fetch('/notifications/read', {
            method: 'POST',
            headers: { Accept: 'application/json', 'X-XSRF-TOKEN': csrf() },
        }).catch(() => undefined);
    };

    return (
        <DropdownMenu onOpenChange={(open) => open && void load(false)}>
            <DropdownMenuTrigger
                aria-label="Notifications"
                className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-dim transition outline-none hover:text-white"
            >
                <Bell className="size-4.5" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-lime-ink">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-[min(340px,calc(100vw-24px))] border-line bg-surface p-0">
                <div className="flex items-center justify-between border-b border-line/60 px-4 py-3">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <button
                        type="button"
                        onClick={markRead}
                        disabled={unread === 0}
                        className="flex items-center gap-1 text-xs font-semibold text-lime disabled:text-dim"
                    >
                        <CheckCheck className="size-3.5" /> Mark all read
                    </button>
                </div>
                <div className="scrollbar-thin max-h-[420px] overflow-y-auto">
                    {items === null && <p className="p-6 text-center text-sm text-dim">Loading…</p>}
                    {items?.length === 0 && (
                        <div className="p-8 text-center text-sm text-dim">
                            <Bell className="mx-auto mb-2 size-6 opacity-50" />
                            No notifications yet.
                        </div>
                    )}
                    {items?.map((n) => {
                        const meta = ICONS[n.kind] ?? ICONS.bonus;
                        return (
                            <Link
                                key={n.id}
                                href={n.url ?? '#'}
                                className="flex gap-3 border-b border-line/40 px-4 py-3 transition last:border-0 hover:bg-surface-2/60"
                            >
                                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                                    <meta.icon className="size-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                                        {n.title}
                                        {!n.read && <span className="size-1.5 rounded-full bg-lime" />}
                                    </span>
                                    <span className="block text-xs leading-snug text-dim">{n.body}</span>
                                    <span className="mt-0.5 block text-[11px] text-dim/70">{ago(n.created_at)}</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
