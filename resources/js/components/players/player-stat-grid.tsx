import { cn } from '@/lib/utils';

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
export default function PlayerStatGrid({ title, items }: Props) {
    const visibleItems = items.filter((item) => item.value !== null);

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <section>
            <h3 className="mb-3 text-base font-semibold">{title}</h3>
            <dl className="divide-y divide-border-subtle">
                {visibleItems.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-baseline justify-between gap-5 py-2.5 text-sm"
                    >
                        <dt className="text-muted-foreground">{item.label}</dt>
                        <dd
                            className={cn(
                                'shrink-0 font-medium tabular-nums',
                                item.value === 0
                                    ? 'text-muted-foreground'
                                    : 'text-foreground',
                            )}
                        >
                            {item.value?.toLocaleString('nl-NL', {
                                maximumFractionDigits: 2,
                            })}
                            {item.suffix && (
                                <span className="ml-1 font-normal text-muted-foreground">
                                    {item.suffix}
                                </span>
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
