import { ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type Country = { code: string; name: string; dial: string };

/** 🇱🇻 from "LV" */
export function flag(code: string): string {
    return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function Field({
    label,
    htmlFor,
    error,
    children,
    className,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('grid gap-2', className)}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

/** Native select styled like our inputs (fast with 200+ options, keyboard search). */
export function NativeSelect({ className, children, ...props }: ComponentProps<'select'>) {
    return (
        <div className={cn('relative', className)}>
            <select
                {...props}
                className="h-11 w-full appearance-none rounded-xl border border-line bg-surface-2/70 pr-9 pl-3.5 text-sm text-white outline-none transition focus-visible:border-lime/70 focus-visible:ring-4 focus-visible:ring-lime/15 aria-invalid:border-destructive [&>option]:bg-surface"
            >
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-dim" />
        </div>
    );
}

export function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center gap-3 pt-2 text-[11px] font-bold tracking-wider text-dim uppercase">
            {children}
            <span className="h-px flex-1 bg-line" />
        </div>
    );
}
