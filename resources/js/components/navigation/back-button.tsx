import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { matches } from '@/routes';

type Props = {
    className?: string;
    fallbackHref?: string;
};

const backButtonClassName =
    'group inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-sm font-bold text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-interactive hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none';

const backButtonIconClassName =
    'flex size-6 items-center justify-center rounded-sm bg-muted text-primary transition-colors group-hover:bg-[#223129] group-hover:text-positive';

export default function BackButton({
    className,
    fallbackHref = matches.url(),
}: Props) {
    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();

            return;
        }

        router.visit(fallbackHref);
    };

    return (
        <button
            type="button"
            onClick={goBack}
            className={cn(backButtonClassName, className)}
        >
            <span className={backButtonIconClassName}>
                <ArrowLeft className="size-4" />
            </span>
            Terug
        </button>
    );
}
