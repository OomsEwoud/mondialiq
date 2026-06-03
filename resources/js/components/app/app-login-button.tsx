import { Link } from '@inertiajs/react';
import { LogIn } from 'lucide-react';

import { cn } from '@/lib/utils';
import { login } from '@/routes';

type Props = {
    className?: string;
};

export default function AppLoginButton({ className }: Props) {
    return (
        <Link
            href={login()}
            className={cn(
                'group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-[linear-gradient(135deg,#cffafe_0%,#67e8f9_48%,#22d3ee_100%)] px-3.5 text-sm font-black text-blue-950 shadow-[0_10px_30px_rgba(8,47,73,0.26),inset_0_1px_0_rgba(255,255,255,0.76)] ring-1 ring-cyan-100/35 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(8,47,73,0.34),inset_0_1px_0_rgba(255,255,255,0.84)] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 focus-visible:outline-none active:translate-y-0 sm:px-4',
                className,
            )}
        >
            <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)] opacity-0 transition-all duration-500 group-hover:translate-x-[220%] group-hover:opacity-100"
            />
            <span className="relative flex items-center gap-2">
                <LogIn className="size-4" aria-hidden="true" />
                <span>Inloggen</span>
            </span>
        </Link>
    );
}
