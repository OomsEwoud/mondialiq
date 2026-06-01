interface Props {
    title: string;
    subtitle: string;
    rows: Array<[string, string]>;
}

export default function PredictionSourceCard({ title, subtitle, rows }: Props) {
    return (
        <article className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div>
                <p className="text-[11px] font-black tracking-[0.18em] text-cyan-600 uppercase">
                    Data signal
                </p>
                <h3 className="mt-1 text-base font-black text-blue-950">
                    {title}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                    {subtitle}
                </p>
            </div>
            <dl className="mt-4 space-y-3">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
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
