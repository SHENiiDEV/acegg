import type { LucideIcon } from 'lucide-react';
import { useRef } from 'react';
import { GameCard } from '@/components/casino/game-card';
import { SectionHeader } from '@/components/casino/section-header';
import type { Game } from '@/types';

/** Horizontally scrolling row of games with prev/next arrows. */
export function GameRail({
    title,
    icon,
    games,
    href,
    id,
}: {
    title: string;
    icon: LucideIcon;
    games: Game[];
    href?: string;
    id?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const scroll = (dir: number) =>
        ref.current?.scrollBy({
            left: dir * ref.current.clientWidth * 0.8,
            behavior: 'smooth',
        });

    if (games.length === 0) return null;

    return (
        <section className="mt-8">
            <SectionHeader
                id={id}
                icon={icon}
                title={title}
                href={href}
                onPrev={() => scroll(-1)}
                onNext={() => scroll(1)}
            />
            <div
                ref={ref}
                className="-mx-1 flex snap-x scrollbar-none gap-3 overflow-x-auto px-1 pb-1"
            >
                {games.map((g) => (
                    <GameCard
                        key={g.id}
                        game={g}
                        className="w-[180px] shrink-0 snap-start sm:w-[200px]"
                    />
                ))}
            </div>
        </section>
    );
}
