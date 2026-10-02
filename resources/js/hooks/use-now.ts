import { useEffect, useState } from 'react';

/**
 * Current time, re-rendered every `ms`. Returns null during SSR and the first
 * client render so server and client markup match (no hydration errors).
 */
export function useNow(ms = 1000): number | null {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        setNow(Date.now());
        const t = setInterval(() => setNow(Date.now()), ms);
        return () => clearInterval(t);
    }, [ms]);
    return now;
}

/** True after the first client render. */
export function useMounted(): boolean {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted;
}
