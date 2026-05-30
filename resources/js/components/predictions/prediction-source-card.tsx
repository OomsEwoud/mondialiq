interface Props {
    title: string;
    subtitle: string;
    rows: Array<[string, string]>;
}

export default function PredictionSourceCard({ title, subtitle, rows }: Props) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
                <h2 className="text-base font-black text-blue-950">{title}</h2>
                <p className="text-xs font-medium text-slate-500">{subtitle}</p>
            </div>
            <dl className="mt-4 space-y-3">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
                    >
                        <dt className="text-sm font-medium text-slate-500">
                            {label}
                        </dt>
                        <dd className="text-right text-sm font-black text-blue-950">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </article>
    );
}
