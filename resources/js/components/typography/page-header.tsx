import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
    className?: string;
    variant?: 'default' | 'top-level';
}

export default function PageHeader({
    eyebrow,
    title,
    description,
    actions,
    className,
    variant = 'default',
}: Props) {
    const isTopLevel = variant === 'top-level';

    return (
        <header
            className={cn(
                isTopLevel
                    ? 'mb-10 flex flex-col gap-5 border-b border-border-subtle pb-8 sm:mb-12 sm:flex-row sm:items-end sm:justify-between'
                    : 'mb-7 flex flex-col gap-5 border-b border-border pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className={cn('min-w-0', !isTopLevel && 'max-w-2xl')}>
                <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                    {eyebrow}
                </p>
                <h1
                    className={cn(
                        isTopLevel
                            ? 'mq-page-title mt-2'
                            : 'mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl',
                    )}
                >
                    {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
            )}
        </header>
    );
}
