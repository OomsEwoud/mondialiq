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
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-100 text-cyan-700">
                    <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                        {label}
                    </p>
                    <p className="mt-1 text-lg leading-tight font-black text-blue-950">
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
