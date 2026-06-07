interface Props {
    title: string;
    subtitle: string;
    rows: Array<[string, string]>;
}

export default function PredictionSourceCard({ title, subtitle, rows }: Props) {
    return (
        <article className="h-full rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                Data signal
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            <dl className="mt-5 space-y-3">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                    >
                        <dt className="text-sm text-slate-500">{label}</dt>
                        <dd className="min-w-0 text-right text-sm font-bold break-words text-slate-900">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </article>
    );
}
