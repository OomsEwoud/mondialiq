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
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-slate-200">
                    <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">
                        {label}
                    </p>
                    {children}
                </div>
            </div>
        </article>
    );
}
