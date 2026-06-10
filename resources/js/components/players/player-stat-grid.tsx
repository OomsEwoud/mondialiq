interface StatItem {
    label: string;
    value: number | null;
    suffix?: string;
    highlight?: boolean;
}

interface Props {
    title: string;
    icon: React.ReactNode;
    items: StatItem[];
}

export default function PlayerStatGrid({ title, icon, items }: Props) {
    const visibleItems = items.filter(
        (item) => item.value !== null && item.value !== undefined,
    );

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm">
            <div className="mb-5 flex shrink-0 items-center gap-2 border-b border-slate-100 pb-3">
                {icon}
                <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
                    {title}
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                {visibleItems.map((item) => {
                    const displayValue =
                        typeof item.value === 'number' && item.value % 1 !== 0
                            ? item.value.toFixed(1)
                            : String(item.value);

                    return (
                        <div key={item.label} className="flex h-full flex-col justify-between gap-1">
                            <p className="text-[11px] font-semibold leading-tight tracking-wider text-slate-400 uppercase">
                                {item.label}
                            </p>
                            <p
                                className={`text-xl font-bold tabular-nums tracking-tight ${
                                    item.highlight
                                        ? 'text-slate-900'
                                        : 'text-slate-700'
                                }`}
                            >
                                {displayValue}
                                {item.suffix ? (
                                    <span className="ml-1 text-sm font-medium text-slate-400">
                                        {item.suffix}
                                    </span>
                                ) : null}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
