import { Link, usePage } from '@inertiajs/react';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { titleCase } from '@/lib/casino';
import { cn } from '@/lib/utils';
import type { Game } from '@/types';

export function GameCard({
    game,
    className,
}: {
    game: Game;
    className?: string;
}) {
    const { auth } = usePage().props;
    const href = auth.user ? `/play/${game.id}` : '/login';
    const [imgOk, setImgOk] = useState(true);
    const image = game.thumbnail;
    const [bg1, bg2] = game.background ?? ['#2a3242', '#151922'];

    return (
        <Link
            href={href}
            className={cn(
                'group relative block overflow-hidden rounded-xl bg-surface ring-1 ring-line/60 transition hover:-translate-y-1 hover:ring-lime/60',
                className,
            )}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                {image && imgOk ? (
                    <img
                        src={image}
                        alt={game.name}
                        loading="lazy"
                        onError={() => setImgOk(false)}
                        className="size-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <FallbackArt game={game} bg1={bg1} bg2={bg2} />
                )}

                {game.bonus_buy && (
                    <span className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-lime uppercase backdrop-blur">
                        Bonus buy
                    </span>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-lg bg-lime px-4 py-2 text-sm font-bold text-lime-ink shadow-lg">
                        <Play className="size-4 fill-current" /> Play
                    </span>
                </div>
            </div>
            <div className="px-2.5 py-2">
                <div className="truncate text-[13px] font-semibold text-white">
                    {game.name}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-dim">
                    <span className="truncate">
                        {titleCase(game.mechanic)} · {game.rtp}
                    </span>
                    {game.max_win_x ? (
                        <span className="shrink-0 font-semibold text-white/70">
                            x{game.max_win_x.toLocaleString('en-US')}
                        </span>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}

function FallbackArt({
    game,
    bg1,
    bg2,
}: {
    game: Game;
    bg1: string;
    bg2: string;
}) {
    return (
        <div
            className="relative flex size-full flex-col items-center justify-center gap-2 overflow-hidden p-3"
            style={{
                background: `radial-gradient(circle at 50% 30%, ${bg1}, ${bg2})`,
            }}
        >
            {game.cover && (
                <>
                    <img
                        src={game.cover}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 size-full scale-110 object-cover opacity-70 transition duration-300 group-hover:scale-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
                </>
            )}
            <div className="relative flex items-end gap-1">
                {game.icons.slice(0, 3).map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt=""
                        loading="lazy"
                        className={cn(
                            'drop-shadow-lg',
                            i === 1 ? 'size-14' : 'size-10 opacity-90',
                        )}
                    />
                ))}
            </div>
            <div
                className="relative text-center text-lg leading-none font-extrabold tracking-tight uppercase drop-shadow-[0_2px_0_rgba(0,0,0,.6)]"
                style={{ color: game.accent ?? '#ffffff' }}
            >
                {game.name}
            </div>
        </div>
    );
}
