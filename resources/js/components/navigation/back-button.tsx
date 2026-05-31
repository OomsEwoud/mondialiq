import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { matches } from '@/routes';

type Props = {
    className?: string;
    fallbackHref?: string;
};

const backButtonClassName =
    'group inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-black text-blue-950 shadow-sm transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus:ring-2 focus:ring-cyan-200 focus:outline-none';

const backButtonIconClassName =
    'flex size-6 items-center justify-center rounded-full bg-white text-blue-950 shadow-sm ring-1 ring-slate-200 transition-colors group-hover:text-cyan-700 group-hover:ring-cyan-200';

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
            Back
        </button>
    );
}
