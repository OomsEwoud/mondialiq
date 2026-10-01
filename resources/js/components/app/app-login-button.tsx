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
                'inline-flex h-9 items-center gap-2 rounded-lg bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                className,
            )}
        >
            <LogIn className="size-4" aria-hidden="true" />
            <span>Inloggen</span>
        </Link>
    );
}
