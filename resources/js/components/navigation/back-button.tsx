import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { matches } from '@/routes';

type Props = {
    className?: string;
    fallbackHref?: string;
};

const backButtonClassName =
    'group inline-flex h-10 items-center gap-2 rounded-md border border-[#343d37] bg-[#111513] px-3 text-sm font-bold text-[#b8bfba] transition-colors hover:border-[#536159] hover:bg-[#1a211d] hover:text-white focus:ring-2 focus:ring-[#57ad78] focus:outline-none';

const backButtonIconClassName =
    'flex size-6 items-center justify-center rounded-sm bg-[#1b211e] text-[#70b98e] transition-colors group-hover:bg-[#223129] group-hover:text-[#9fc9af]';

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
