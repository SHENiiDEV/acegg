import { Head, Link } from '@inertiajs/react';
import { Home, RotateCw } from 'lucide-react';
import { HeroArt, Logo } from '@/components/casino/art';

const COPY: Record<number, { title: string; text: string }> = {
    403: { title: 'Access denied', text: "You don't have permission to open this page." },
    404: { title: 'Page not found', text: 'This page went bust. Let’s get you back to the lobby.' },
    419: { title: 'Session expired', text: 'Your session timed out. Refresh the page and try again.' },
    429: { title: 'Slow down', text: 'Too many requests. Take a breath and try again in a minute.' },
    500: { title: 'Something broke', text: 'An unexpected error happened on our side. We are on it.' },
    503: { title: 'Back soon', text: 'We are doing a quick maintenance spin. Please check back shortly.' },
};

/** Standalone error page (no shared props required — middleware may not have run). */
export default function ErrorPage({ status }: { status: number }) {
    const copy = COPY[status] ?? COPY[500];

    return (
        <div className="bg-suits flex min-h-svh flex-col bg-page px-5 py-6 text-white">
            <Head title={copy.title} />
            <Link href="/" className="self-start">
                <Logo />
            </Link>
            <div className="flex flex-1 flex-col items-center justify-center text-center">
                <HeroArt className="w-full max-w-[420px]" />
                <div className="mt-2 bg-gradient-to-b from-lime to-[#5fbf0a] bg-clip-text text-7xl font-extrabold tracking-tight text-transparent md:text-8xl">
                    {status}
                </div>
                <h1 className="mt-2 text-2xl font-bold">{copy.title}</h1>
                <p className="mt-2 max-w-sm text-sm text-dim">{copy.text}</p>
                <div className="mt-6 flex gap-2">
                    <Link href="/" className="flex items-center gap-2 rounded-xl bg-lime px-5 py-3 text-sm font-bold text-lime-ink">
                        <Home className="size-4" /> Back to lobby
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 rounded-xl bg-surface-2 px-5 py-3 text-sm font-semibold hover:bg-line"
                    >
                        <RotateCw className="size-4" /> Retry
                    </button>
                </div>
            </div>
        </div>
    );
}
