import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { GameBrowser } from '@/components/casino/game-browser';
import { findFilter } from '@/lib/casino';
import type { Game } from '@/types';

export default function Games({
    games,
    filter,
    search,
    theme,
}: {
    games: Game[];
    filter: string;
    search: string;
    theme: string;
}) {
    const f = findFilter(filter);

    return (
        <>
            <Head title={f.label} />
            <div className="mb-4 flex items-center gap-3">
                <Link
                    href="/"
                    className="flex items-center gap-1 rounded-lg bg-surface-2 px-2 py-1 text-xs font-semibold text-white hover:bg-line"
                >
                    <ChevronLeft className="size-3.5" /> Back
                </Link>
                <h1 className="flex items-center gap-2 text-lg font-semibold">
                    <f.icon className="size-5 text-lime" /> {f.label}
                </h1>
            </div>
            {/* key resets internal state when the sidebar link changes */}
            <GameBrowser
                key={`${filter}|${search}|${theme}`}
                games={games}
                initialFilter={filter}
                initialSearch={search}
                initialTheme={theme}
            />
        </>
    );
}
