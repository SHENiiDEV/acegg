import { Head, Link } from '@inertiajs/react';
import { Dices, Layers3, Sparkles, WifiOff } from 'lucide-react';
import { useMemo } from 'react';
import { GameBrowser } from '@/components/casino/game-browser';
import { GameRail } from '@/components/casino/game-rail';
import {
    CategoryTiles,
    Hero,
    Promotions,
} from '@/components/casino/home-sections';
import { SectionHeader } from '@/components/casino/section-header';
import { findFilter, titleCase } from '@/lib/casino';
import type { Game } from '@/types';

type Props = {
    games: Game[];
    welcomeBonus: number;
    spinKitOnline: boolean;
};

export default function Home({
    games,
    welcomeBonus,
    spinKitOnline,
}: Props) {
    const newest = useMemo(
        () => findFilter('new').apply(games).slice(0, 12),
        [games],
    );
    const themes = useMemo(() => {
        const counts = new Map<string, Game>();
        games.forEach(
            (g) =>
                g.category &&
                !counts.has(g.category) &&
                counts.set(g.category, g),
        );
        return [...counts.entries()].map(([name, sample]) => ({
            name,
            sample,
            count: games.filter((g) => g.category === name).length,
        }));
    }, [games]);

    return (
        <>
            <Head title="Social Casino" />

            {!spinKitOnline && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    <WifiOff className="size-4" />
                    Game server is offline or not configured — set SPINKIT_URL
                    and SPINKIT_TOKEN in .env.
                </div>
            )}
            <Hero welcomeBonus={welcomeBonus} />
            <CategoryTiles />

            <section className="mt-8">
                <SectionHeader icon={Dices} title="Slots" href="/games" />
                <GameBrowser games={games} limit={12} />
            </section>

            <Promotions />

            <GameRail
                title="New releases"
                icon={Sparkles}
                games={newest}
                href="/games?filter=new"
            />

            {themes.length > 0 && (
                <section className="mt-8">
                    <SectionHeader
                        icon={Layers3}
                        title="Themes"
                        href="/games"
                    />
                    <div className="-mx-1 flex scrollbar-none gap-2 overflow-x-auto px-1 pb-1">
                        {themes.map((t) => (
                            <Link
                                key={t.name}
                                href={`/games?theme=${encodeURIComponent(t.name)}`}
                                className="flex h-16 w-44 shrink-0 items-center gap-3 rounded-xl bg-surface px-3 ring-1 ring-line/60 transition hover:ring-lime/50"
                            >
                                <span
                                    className="flex size-10 items-center justify-center rounded-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${t.sample.background?.[0] ?? '#2a3242'}, ${t.sample.background?.[1] ?? '#151922'})`,
                                    }}
                                >
                                    {t.sample.icons[0] && (
                                        <img
                                            src={t.sample.icons[0]}
                                            alt=""
                                            className="size-7"
                                        />
                                    )}
                                </span>
                                <span className="leading-tight">
                                    <span className="block text-sm font-semibold text-white">
                                        {titleCase(t.name)}
                                    </span>
                                    <span className="text-xs text-dim">
                                        {t.count} games
                                    </span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
