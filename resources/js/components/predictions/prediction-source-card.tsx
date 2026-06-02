interface Props {
    title: string;
    subtitle: string;
    rows: Array<[string, string]>;
}

export default function PredictionSourceCard({ title, subtitle, rows }: Props) {
    return (
        <article className="h-full rounded-[1.75rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-5 shadow-lg shadow-cyan-950/6 sm:p-6">
            <div>
                <p className="text-[11px] font-black tracking-[0.18em] text-cyan-700 uppercase">
                    Data signal
                </p>
                <h3 className="mt-2 text-xl font-black text-blue-950">
                    {title}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    {subtitle}
                </p>
            </div>
            <dl className="mt-5 space-y-3">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                    >
                        <dt className="text-sm font-medium text-slate-500">
                            {label}
                        </dt>
                        <dd className="min-w-0 text-right text-sm font-black break-words text-blue-950">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </article>
    );
}
