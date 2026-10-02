import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function SectionHeader({
    icon: Icon,
    title,
    href,
    onPrev,
    onNext,
    id,
}: {
    icon: LucideIcon;
    title: string;
    href?: string;
    onPrev?: () => void;
    onNext?: () => void;
    id?: string;
}) {
    return (
        <div id={id} className="mb-3 flex scroll-mt-24 items-center gap-2">
            <Icon className="size-4.5 text-lime" />
            <h2 className="text-[15px] font-semibold text-white">{title}</h2>
            <div className="ml-auto flex items-center gap-1.5">
                {href && (
                    <Link
                        href={href}
                        className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold text-white hover:bg-line"
                    >
                        View all
                    </Link>
                )}
                {onPrev && (
                    <button
                        type="button"
                        onClick={onPrev}
                        className="flex size-7 items-center justify-center rounded-lg bg-surface-2 text-dim hover:text-white"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                )}
                {onNext && (
                    <button
                        type="button"
                        onClick={onNext}
                        className="flex size-7 items-center justify-center rounded-lg bg-surface-2 text-dim hover:text-white"
                        aria-label="Next"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
