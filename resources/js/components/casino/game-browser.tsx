import { Layers3, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GameCard } from '@/components/casino/game-card';
import { GAME_FILTERS, findFilter, searchGames, titleCase } from '@/lib/casino';
import { cn } from '@/lib/utils';
import type { Game } from '@/types';

const PAGE = 18;

/** Search + theme select + filter chips + grid. Used on home and /games. */
export function GameBrowser({
    games,
    initialFilter = 'all',
    initialSearch = '',
    initialTheme = 'all',
    limit,
}: {
    games: Game[];
    initialFilter?: string;
    initialSearch?: string;
    initialTheme?: string;
    limit?: number;
}) {
    const [filter, setFilter] = useState(initialFilter);
    const [q, setQ] = useState(initialSearch);
    const [theme, setTheme] = useState(initialTheme);
    const [shown, setShown] = useState(limit ?? PAGE);

    const themes = useMemo(
        () =>
            [
                ...new Set(
                    games
                        .map((g) => g.category)
                        .filter((c): c is string => Boolean(c)),
                ),
            ].sort(),
        [games],
    );
    const filters = useMemo(
        () => GAME_FILTERS.filter((f) => f.apply(games).length > 0),
        [games],
    );

    const list = useMemo(() => {
        let r = findFilter(filter).apply(games);
        if (theme !== 'all') r = r.filter((g) => g.category === theme);
        return searchGames(r, q);
    }, [games, filter, theme, q]);

    return (
        <div>
            <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex flex-1 items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 ring-1 ring-line/60">
                    <Search className="size-4 text-dim" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search for games"
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-dim"
                    />
                </label>
                <label className="flex items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-sm ring-1 ring-line/60 sm:w-60">
                    <Layers3 className="size-4 text-dim" />
                    <span className="text-dim">Theme:</span>
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full bg-transparent font-semibold text-white outline-none [&>option]:bg-surface"
                    >
                        <option value="all">All</option>
                        {themes.map((t) => (
                            <option key={t} value={t}>
                                {titleCase(t)}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="-mx-1 mt-3 flex scrollbar-none gap-1.5 overflow-x-auto px-1 pb-1">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => {
                            setFilter(f.key);
                            setShown(limit ?? PAGE);
                        }}
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                            filter === f.key
                                ? 'bg-lime text-lime-ink'
                                : 'bg-surface text-white/85 ring-1 ring-line/60 hover:bg-surface-2',
                        )}
                    >
                        <f.icon className="size-3.5" />
                        {f.label}
                    </button>
                ))}
            </div>

            {list.length === 0 ? (
                <div className="mt-4 rounded-xl bg-surface p-10 text-center text-sm text-dim ring-1 ring-line/60">
                    {games.length === 0
                        ? 'Games are loading from the game server. Check SPINKIT_URL / SPINKIT_TOKEN in .env.'
                        : 'No games match your search.'}
                </div>
            ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {list.slice(0, shown).map((g) => (
                        <GameCard key={g.id} game={g} />
                    ))}
                </div>
            )}

            {list.length > shown && (
                <div className="mt-5 flex flex-col items-center gap-2">
                    <span className="text-xs text-dim">
                        Showing {shown} of {list.length}
                    </span>
                    <button
                        type="button"
                        onClick={() => setShown((s) => s + PAGE)}
                        className="rounded-xl bg-surface-2 px-6 py-2.5 text-sm font-semibold text-white ring-1 ring-line hover:bg-line"
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
}
