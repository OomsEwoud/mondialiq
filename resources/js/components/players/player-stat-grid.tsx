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
        <section className="flex h-full flex-col rounded-lg border border-[#29312c] bg-[#111513] p-5">
            <div className="mb-5 flex shrink-0 items-center gap-2 border-b border-[#29312c] pb-3 text-[#70b98e]">
                {icon}
                <h3 className="text-xs font-bold text-[#daddd9] uppercase">
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
                        <div
                            key={item.label}
                            className="flex h-full flex-col justify-between gap-1"
                        >
                            <p className="text-[11px] leading-tight font-semibold text-[#68716b] uppercase">
                                {item.label}
                            </p>
                            <p
                                className={`text-xl font-bold tracking-tight tabular-nums ${
                                    item.highlight
                                        ? 'text-[#8fd0a8]'
                                        : 'text-[#daddd9]'
                                }`}
                            >
                                {displayValue}
                                {item.suffix ? (
                                    <span className="ml-1 text-sm font-medium text-[#68716b]">
                                        {item.suffix}
                                    </span>
                                ) : null}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
