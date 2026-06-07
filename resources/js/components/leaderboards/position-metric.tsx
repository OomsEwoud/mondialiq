type Props = {
    label: string;
    value: string;
    suffix: string;
};

export default function PositionMetric({ label, value, suffix }: Props) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                {label}
            </p>
            <div className="mt-2 flex items-end gap-2">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="pb-1 text-xs font-semibold text-slate-500">
                    {suffix}
                </p>
            </div>
        </div>
    );
}
