import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function PageTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 rounded-lg bg-surface-2 px-2 py-1 text-xs font-semibold text-white hover:bg-line">
                <ChevronLeft className="size-3.5" /> Back
            </Link>
            <h1 className="flex items-center gap-2 text-[15px] font-semibold">
                <span className="flex size-5 items-center justify-center rounded-md bg-lime text-lime-ink">
                    <Icon className="size-3.5" />
                </span>
                {title}
            </h1>
        </div>
    );
}

/** Countdown text; '--:--' while the clock is not known yet (SSR). */
export function formatLeft(ms: number | null): string {
    if (ms === null || Number.isNaN(ms)) return '--:--';
    const s = Math.max(0, Math.floor(ms / 1000));
    const pad = (n: number) => String(n).padStart(2, '0');
    const h = Math.floor(s / 3600);
    if (h >= 48) return `${Math.floor(h / 24)}d ${pad(h % 24)}h`;
    return `${h > 0 ? `${pad(h)}:` : ''}${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
