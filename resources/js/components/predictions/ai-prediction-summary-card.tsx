import type { LucideIcon } from 'lucide-react';
import type * as React from 'react';

interface Props {
    icon: LucideIcon;
    label: string;
    children: React.ReactNode;
}

export default function AiPredictionSummaryCard({
    icon: Icon,
    label,
    children,
}: Props) {
    return (
        <article className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="size-5" />
                </span>
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    {label}
                </p>
            </div>
            <div className="mt-4">{children}</div>
        </article>
    );
}
