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
        <article className="rounded-[1.7rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.95))] p-5 shadow-lg shadow-cyan-950/6 sm:p-6">
            <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
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
