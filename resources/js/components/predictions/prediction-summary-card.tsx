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
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Icon className="size-5" />
                </span>
                <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                    {label}
                </p>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            {helper && (
                <p className="mt-1 text-sm text-slate-500">{helper}</p>
            )}
        </article>
    );
}
