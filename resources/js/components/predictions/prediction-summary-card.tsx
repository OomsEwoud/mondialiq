import type { LucideIcon } from 'lucide-react';

interface Props {
    icon: LucideIcon;
    label: string;
    value: string;
    helper?: string;
}

export default function PredictionSummaryCard({
    icon: Icon,
    label,
    value,
    helper,
}: Props) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 ring-1 ring-cyan-200/60">
                    <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                        {label}
                    </p>
                    <p className="mt-1 text-xl leading-tight font-bold text-slate-900">
                        {value}
                    </p>
                    {helper ? (
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                            {helper}
                        </p>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
