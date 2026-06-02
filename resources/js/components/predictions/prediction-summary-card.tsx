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
        <article className="rounded-[1.55rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.95))] p-5 shadow-lg shadow-cyan-950/6">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200/60">
                    <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                        {label}
                    </p>
                    <p className="mt-1 text-xl leading-tight font-black text-blue-950">
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
