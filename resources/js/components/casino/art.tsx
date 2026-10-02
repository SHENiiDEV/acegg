/**
 * Original vector art for ACEGG (logo mark, coin, banner illustration,
 * tile icons). Kept in one file so the brand can be swapped easily.
 */
import { useId } from 'react';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
            <path
                d="M16 3c4.6 5.4 11 8.7 11 14.3a6.3 6.3 0 0 1-10.2 4.9l1.9 6.8h-5.4l1.9-6.8A6.3 6.3 0 0 1 5 17.3C5 11.7 11.4 8.4 16 3Z"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinejoin="round"
            />
            <path
                d="M12 19.5 16 12l4 7.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
    return (
        <span className={cn('flex items-center gap-2', className)}>
            <LogoMark className="size-7 text-lime" />
            <span className={cn('text-[19px] font-extrabold tracking-tight text-white', textClassName)}>
                ACE<span className="text-lime">GG</span>
            </span>
        </span>
    );
}

export function CoinIcon({ className }: { className?: string }) {
    const id = useId();
    return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffd25a" />
                    <stop offset="1" stopColor="#f08a00" />
                </linearGradient>
            </defs>
            <circle cx="10" cy="10" r="9" fill={`url(#${id})`} />
            <circle
                cx="10"
                cy="10"
                r="6.2"
                fill="none"
                stroke="#ffe9a6"
                strokeOpacity=".7"
                strokeWidth="1.2"
            />
            <path
                d="M10 6.2v7.6M7.8 8.2h4.4"
                stroke="#a65400"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

/** Hero illustration: stacked coins, floating gems and a glowing ace card. */
export function HeroArt({ className }: { className?: string }) {
    const id = useId().replace(/:/g, '');
    const coin = (x: number, y: number, k: number) => (
        <g key={`${x}-${y}-${k}`} transform={`translate(${x} ${y})`}>
            <ellipse cx="0" cy="10" rx="46" ry="15" fill="#a65400" />
            <rect x="-46" y="0" width="92" height="10" fill="#c46a00" />
            <ellipse cx="0" cy="0" rx="46" ry="15" fill={`url(#coin-${id})`} />
            <ellipse
                cx="0"
                cy="0"
                rx="32"
                ry="10"
                fill="none"
                stroke="#fff3c4"
                strokeOpacity=".55"
                strokeWidth="2"
            />
        </g>
    );
    return (
        <svg viewBox="0 0 520 300" className={className} aria-hidden>
            <defs>
                <linearGradient id={`coin-${id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffe27a" />
                    <stop offset="1" stopColor="#f5a300" />
                </linearGradient>
                <linearGradient id={`card-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#dfe7f5" />
                </linearGradient>
                <linearGradient id={`gem-${id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#8fe1ff" />
                    <stop offset="1" stopColor="#1b6ff2" />
                </linearGradient>
                <linearGradient id={`gem2-${id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#e8ff8a" />
                    <stop offset="1" stopColor="#5fbf0a" />
                </linearGradient>
                <radialGradient id={`glow-${id}`}>
                    <stop offset="0" stopColor="#c9f73a" stopOpacity=".55" />
                    <stop offset="1" stopColor="#c9f73a" stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx="300" cy="150" r="170" fill={`url(#glow-${id})`} />
            {/* cards */}
            <g transform="translate(250 40) rotate(-12)">
                <rect
                    width="120"
                    height="168"
                    rx="14"
                    fill="#1d2330"
                    stroke="#c9f73a"
                    strokeOpacity=".5"
                />
            </g>
            <g transform="translate(290 30) rotate(8)">
                <rect
                    width="124"
                    height="172"
                    rx="14"
                    fill={`url(#card-${id})`}
                />
                <text
                    x="16"
                    y="34"
                    fontSize="28"
                    fontWeight="800"
                    fill="#11160a"
                    fontFamily="Outfit, sans-serif"
                >
                    A
                </text>
                <path
                    d="M62 52c12 14 28 22 28 37a14 14 0 0 1-23 10l4 16H53l4-16a14 14 0 0 1-23-10c0-15 16-23 28-37Z"
                    fill="#11160a"
                />
                <text
                    x="108"
                    y="160"
                    fontSize="28"
                    fontWeight="800"
                    fill="#11160a"
                    textAnchor="end"
                    fontFamily="Outfit, sans-serif"
                >
                    A
                </text>
            </g>
            {/* coin stacks */}
            {[0, 1, 2, 3, 4, 5].map((k) => coin(205, 250 - k * 14, k))}
            {[0, 1, 2, 3].map((k) => coin(440, 262 - k * 14, k))}
            {[0, 1].map((k) => coin(330, 276 - k * 14, k))}
            {/* gems */}
            <g transform="translate(120 70) rotate(-14)">
                <path d="M0 18 18 0h30l18 18-33 40Z" fill={`url(#gem-${id})`} />
                <path
                    d="M0 18h66M18 0l15 58M48 0 33 58"
                    stroke="#ffffff"
                    strokeOpacity=".45"
                    strokeWidth="1.5"
                    fill="none"
                />
            </g>
            <g transform="translate(455 60) rotate(16)">
                <path
                    d="M0 13 13 0h22l13 13-24 30Z"
                    fill={`url(#gem2-${id})`}
                />
                <path
                    d="M0 13h48M13 0l11 43M35 0 24 43"
                    stroke="#ffffff"
                    strokeOpacity=".5"
                    strokeWidth="1.2"
                    fill="none"
                />
            </g>
            {/* sparkles */}
            {[
                [100, 190, 5],
                [480, 170, 4],
                [270, 20, 3],
                [400, 230, 3],
            ].map(([x, y, r]) => (
                <path
                    key={`${x}${y}`}
                    d={`M${x} ${y - r * 3}q${r * 0.4} ${r * 2.6} ${r * 3} ${r * 3}q-${r * 2.6} ${r * 0.4}-${r * 3} ${r * 3}q-${r * 0.4}-${r * 2.6}-${r * 3}-${r * 3}q${r * 2.6}-${r * 0.4} ${r * 3}-${r * 3}Z`}
                    fill="#ffffff"
                    opacity=".85"
                />
            ))}
        </svg>
    );
}

/** VIP tier medal, tinted with the tier colour. */
export function Medal({ color = '#c3cad6', className }: { color?: string; className?: string }) {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 200 200" className={className} aria-hidden>
            <defs>
                <linearGradient id={`m1-${id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
                    <stop offset=".45" stopColor={color} />
                    <stop offset="1" stopColor="#1b2029" stopOpacity=".9" />
                </linearGradient>
                <linearGradient id={`m2-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={color} />
                    <stop offset="1" stopColor="#0f1218" />
                </linearGradient>
                <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor={color} />
                </linearGradient>
                <radialGradient id={`glow-${id}`}>
                    <stop offset="0" stopColor={color} stopOpacity=".45" />
                    <stop offset="1" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="98" fill={`url(#glow-${id})`} />
            {/* outer gear ring */}
            {Array.from({ length: 12 }).map((_, i) => (
                <rect key={i} x="92" y="14" width="16" height="22" rx="4" fill={`url(#m1-${id})`} transform={`rotate(${i * 30} 100 100)`} />
            ))}
            <circle cx="100" cy="100" r="70" fill={`url(#m1-${id})`} />
            <circle cx="100" cy="100" r="58" fill={`url(#m2-${id})`} stroke="#ffffff" strokeOpacity=".35" strokeWidth="2" />
            {/* gem */}
            <path d="M100 58 128 100 100 142 72 100Z" fill={`url(#g-${id})`} />
            <path d="M100 58v84M72 100h56" stroke="#ffffff" strokeOpacity=".55" strokeWidth="2" />
            <path d="M100 58 114 100 100 142 86 100Z" fill="#ffffff" fillOpacity=".18" />
        </svg>
    );
}
