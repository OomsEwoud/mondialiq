import type { ReactNode } from 'react';

interface Props {
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
}

export default function PageHeader({
    eyebrow,
    title,
    description,
    actions,
}: Props) {
    return (
        <header className="mb-7 flex flex-col gap-5 border-b border-border pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl min-w-0">
                <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                    {eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
