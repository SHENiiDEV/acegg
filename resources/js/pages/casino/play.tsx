import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Expand, Info, Sparkles, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { GameRail } from '@/components/casino/game-rail';
import { titleCase } from '@/lib/casino';
import type { Game } from '@/types';

export default function Play({ game, launchUrl, related }: { game: Game; launchUrl: string; related: Game[] }) {
    const frame = useRef<HTMLDivElement>(null);
    const close = () => router.post('/play/leave');

    // SpinKit posts {type: 'spinkit:close'} when the in-game lobby button is pressed.
    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            if ((e.data as { type?: string } | null)?.type === 'spinkit:close') close();
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    return (
        <>
            <Head title={game.name} />
            <div className="flex items-center gap-3 px-3 py-2 md:mb-3 md:px-0 md:py-0">
                <button
                    type="button"
                    onClick={close}
                    className="flex items-center gap-1 rounded-lg bg-surface-2 px-2 py-1 text-xs font-semibold text-white hover:bg-line"
                >
                    <ChevronLeft className="size-3.5" /> Lobby
                </button>
                <h1 className="truncate text-lg font-semibold">{game.name}</h1>
                <div className="ml-auto flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => frame.current?.requestFullscreen?.()}
                        className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-dim hover:text-white"
                        aria-label="Fullscreen"
                    >
                        <Expand className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={close}
                        className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-dim hover:text-white"
                        aria-label="Close game"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>

            <div ref={frame} className="overflow-hidden bg-black md:rounded-2xl md:ring-1 md:ring-line/60">
                {/* Phones: the game fills the screen under the header. Desktop: 16:9. */}
                <iframe
                    src={launchUrl}
                    title={game.name}
                    className="h-[calc(100svh-6.5rem)] w-full md:aspect-video md:h-auto md:max-h-[calc(100svh-12rem)]"
                    allow="autoplay; fullscreen"
                />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 px-3 text-xs md:px-0">
                <Info className="size-3.5 text-dim" />
                {[
                    ['Mechanic', titleCase(game.mechanic)],
                    ['RTP', game.rtp],
                    ['Volatility', titleCase(game.volatility)],
                    ['Max win', game.max_win_x ? `x${game.max_win_x.toLocaleString('en-US')}` : '—'],
                ].map(([k, v]) => (
                    <span key={k} className="rounded-lg bg-surface px-2.5 py-1 ring-1 ring-line/60">
                        <span className="text-dim">{k}:</span> <span className="font-semibold text-white">{v}</span>
                    </span>
                ))}
                <Link href="/legal/social-casino-rules" className="ml-auto text-dim underline-offset-2 hover:text-white hover:underline">
                    Coins have no cash value
                </Link>
            </div>

            <div className="px-3 pb-6 md:px-0 md:pb-0">
                <GameRail title="More like this" icon={Sparkles} games={related} />
            </div>
        </>
    );
}
