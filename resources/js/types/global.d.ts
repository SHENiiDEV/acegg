import type { Auth } from '@/types/auth';
import type { Company, Wallet } from '@/types/casino';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            wallet: Wallet | null;
            notifications: { unread: number } | null;
            casino: { currency: string; welcome_bonus: number; daily_bonus: number; payment_logos: string[] };
            company: Company;
            [key: string]: unknown;
        };
    }
}
