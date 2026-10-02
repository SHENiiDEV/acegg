import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES = {
    lime: 'from-[#e9ff8a] to-[#5fbf0a] text-[#173300] shadow-[0_8px_24px_-6px_rgba(140,220,20,.7)]',
    sky: 'from-[#9fe4ff] to-[#1b6ff2] text-[#04224f] shadow-[0_8px_24px_-6px_rgba(30,140,240,.7)]',
    amber: 'from-[#ffe27a] to-[#f08a00] text-[#5a2a00] shadow-[0_8px_24px_-6px_rgba(245,160,0,.7)]',
    rose: 'from-[#ffb1c4] to-[#e8335e] text-[#4d0016] shadow-[0_8px_24px_-6px_rgba(232,51,94,.7)]',
    violet: 'from-[#dcc2ff] to-[#7c3aed] text-[#24074f] shadow-[0_8px_24px_-6px_rgba(124,58,237,.7)]',
} as const;

export type Tone = keyof typeof TONES;

/** Glossy "3D-ish" icon used on tiles and banners. */
export function IconBadge({
    icon: Icon,
    tone = 'lime',
    className,
    iconClassName,
}: {
    icon: LucideIcon;
    tone?: Tone;
    className?: string;
    iconClassName?: string;
}) {
    return (
        <span
            className={cn(
                'relative inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br',
                TONES[tone],
                className,
            )}
        >
            <span className="absolute inset-x-2 top-1 h-1/3 rounded-full bg-white/40 blur-[2px]" />
            <Icon
                className={cn('relative size-7', iconClassName)}
                strokeWidth={2.4}
            />
        </span>
    );
}
