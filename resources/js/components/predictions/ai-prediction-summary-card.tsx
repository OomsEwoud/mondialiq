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
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="mb-2 text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                        {label}
                    </p>
                    {children}
                </div>
            </div>
        </article>
    );
}
