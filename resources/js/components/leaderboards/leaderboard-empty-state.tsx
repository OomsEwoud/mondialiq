import { Link } from '@inertiajs/react';
import { LogIn, Plus, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string | null;
    actionDisabled?: boolean;
    secondaryActionLabel?: string;
    secondaryActionHref?: string | null;
    secondaryActionDisabled?: boolean;
    className?: string;
};

const emptyStateButtonClassName =
    'h-10 w-full rounded-lg px-4 font-semibold sm:w-auto';

export default function LeaderboardEmptyState({
    title,
    description,
    actionLabel,
    actionHref,
    actionDisabled = false,
    secondaryActionLabel,
    secondaryActionHref,
    secondaryActionDisabled = false,
    className,
}: Props) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center sm:px-8 sm:py-10',
                className,
            )}
        >
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-slate-200">
                <Trophy className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {description}
            </p>
            {(actionLabel || secondaryActionLabel) && (
                <div className="mx-auto mt-5 flex w-full max-w-sm flex-col justify-center gap-2 sm:max-w-none sm:flex-row">
                    {actionHref && !actionDisabled ? (
                        <Button asChild className={emptyStateButtonClassName}>
                            <Link href={actionHref}>
                                <Plus className="size-4" />
                                {actionLabel}
                            </Link>
                        </Button>
                    ) : (
                        actionLabel && (
                            <Button
                                type="button"
                                disabled
                                className={emptyStateButtonClassName}
                            >
                                <Plus className="size-4" />
                                {actionLabel}
                            </Button>
                        )
                    )}
                    {secondaryActionLabel &&
                        secondaryActionHref &&
                        !secondaryActionDisabled && (
                            <Button
                                asChild
                                variant="outline"
                                className="h-10 w-full rounded-xl border-slate-200 bg-white px-4 font-bold text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 sm:w-auto"
                            >
                                <Link href={secondaryActionHref}>
                                    <LogIn className="size-4" />
                                    {secondaryActionLabel}
                                </Link>
                            </Button>
                        )}
                    {secondaryActionLabel &&
                        (!secondaryActionHref || secondaryActionDisabled) && (
                            <Button
                                type="button"
                                disabled
                                variant="outline"
                                className="h-10 w-full rounded-lg px-4 font-semibold sm:w-auto"
                            >
                                <LogIn className="size-4" />
                                {secondaryActionLabel}
                            </Button>
                        )}
                </div>
            )}
        </div>
    );
}
