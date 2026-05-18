import { Link } from '@inertiajs/react';
import { Plus, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string | null;
    className?: string;
};

export default function LeaderboardEmptyState({
    title,
    description,
    actionLabel,
    actionHref,
    className,
}: Props) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center sm:px-8',
                className,
            )}
        >
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm ring-1 ring-slate-200">
                <Trophy className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-black text-blue-950">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {description}
            </p>
            {actionLabel && (
                <div className="mt-5 flex justify-center">
                    {actionHref ? (
                        <Button asChild className="h-10 rounded-lg px-4 font-black">
                            <Link href={actionHref}>
                                <Plus className="size-4" />
                                {actionLabel}
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            disabled
                            className="h-10 rounded-lg px-4 font-black"
                        >
                            <Plus className="size-4" />
                            {actionLabel}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
