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
                'rounded-2xl border border-dashed border-border bg-muted/80 px-5 py-8 text-center sm:px-8 sm:py-10',
                className,
            )}
        >
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent text-primary shadow-sm ring-1 ring-border">
                <Trophy className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
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
                                className="h-10 w-full rounded-xl border-border bg-card px-4 font-bold text-foreground hover:border-border hover:bg-accent hover:text-primary sm:w-auto"
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
