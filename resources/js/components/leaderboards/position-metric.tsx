type Props = {
    label: string;
    value: string;
    suffix: string;
};

export default function PositionMetric({ label, value, suffix }: Props) {
    return (
        <div className="rounded-2xl border border-border bg-muted px-4 py-4">
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            <div className="mt-2 flex items-end gap-2">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="pb-1 text-xs font-semibold text-muted-foreground">
                    {suffix}
                </p>
            </div>
        </div>
    );
}
