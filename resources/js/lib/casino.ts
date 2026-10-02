import {
    ArrowDownWideNarrow,
    Flame,
    Gem,
    Grid3x3,
    Layers,
    LayoutGrid,
    Lock,
    Rows3,
    ShoppingBag,
    Sparkles,
    Trophy,
    Waypoints,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Game } from '@/types';

/** Minor units (100 = 1 coin) → "5,000.00" */
export function formatCoins(minor: number, digits = 2): string {
    return (minor / 100).toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

/** Compact: 1250000 minor → "12.5K" */
export function formatCoinsShort(minor: number): string {
    const v = minor / 100;
    if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(1)}M`;
    if (v >= 10_000) return `${+(v / 1_000).toFixed(1)}K`;
    return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export type GameFilter = {
    key: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
    apply: (games: Game[]) => Game[];
};

const byMechanic =
    (...m: string[]) =>
    (games: Game[]) =>
        games.filter((g) => g.mechanic !== null && m.includes(g.mechanic));

export const GAME_FILTERS: GameFilter[] = [
    { key: 'all', label: 'All Games', icon: LayoutGrid, apply: (g) => g },
    {
        key: 'hot',
        label: 'Hot',
        icon: Flame,
        apply: (games) =>
            [...games]
                .sort((a, b) => (b.max_win_x ?? 0) - (a.max_win_x ?? 0))
                .slice(0, 18),
    },
    {
        key: 'new',
        label: 'New',
        icon: Sparkles,
        apply: (games) => [...games].reverse().slice(0, 18),
    },
    {
        key: 'bonus-buy',
        label: 'Bonus Buy',
        icon: ShoppingBag,
        badge: 'NEW',
        apply: (games) => games.filter((g) => g.bonus_buy),
    },
    {
        key: 'megaways',
        label: 'Megaways',
        icon: Layers,
        apply: byMechanic('megaways'),
    },
    {
        key: 'clusters',
        label: 'Cluster Pays',
        icon: Grid3x3,
        apply: byMechanic('clusters'),
    },
    {
        key: 'tumble',
        label: 'Tumble',
        icon: ArrowDownWideNarrow,
        apply: byMechanic('tumble'),
    },
    {
        key: 'hold-win',
        label: 'Hold & Win',
        icon: Lock,
        apply: byMechanic('holdwin'),
    },
    {
        key: 'giants',
        label: 'Giant Symbols',
        icon: Gem,
        apply: byMechanic('giants'),
    },
    {
        key: 'lines',
        label: 'Classic Lines',
        icon: Rows3,
        apply: byMechanic('lines', 'matchlines'),
    },
    {
        key: 'ways',
        label: 'Ways to Win',
        icon: Waypoints,
        apply: byMechanic('ways'),
    },
    {
        key: 'top',
        label: 'Top RTP',
        icon: Trophy,
        apply: (games) =>
            [...games]
                .sort(
                    (a, b) =>
                        parseFloat(b.rtp ?? '0') - parseFloat(a.rtp ?? '0'),
                )
                .slice(0, 24),
    },
];

export function findFilter(key: string): GameFilter {
    return GAME_FILTERS.find((f) => f.key === key) ?? GAME_FILTERS[0];
}

export function searchGames(games: Game[], q: string): Game[] {
    const s = q.trim().toLowerCase();
    if (!s) return games;
    return games.filter(
        (g) =>
            g.name.toLowerCase().includes(s) ||
            (g.category ?? '').toLowerCase().includes(s),
    );
}

export function titleCase(s: string | null): string {
    if (!s) return '';
    return s.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
