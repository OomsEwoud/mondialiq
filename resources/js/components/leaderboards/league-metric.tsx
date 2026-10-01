import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    icon: LucideIcon;
    label: string;
    value: string;
    iconClassName?: string;
    labelClassName?: string;
    className?: string;
};

export default function LeagueMetric({
    icon: Icon,
    label,
    value,
    iconClassName,
    labelClassName,
    className,
}: Props) {
    return (
        <div
            className={cn('rounded-xl border px-3.5 py-3 shadow-xs', className)}
        >
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon
                    className={cn(
                        'size-4',
                        iconClassName ?? 'text-muted-foreground',
                    )}
                />
                <p
                    className={cn(
                        'text-xs font-bold tracking-wide uppercase',
                        labelClassName,
                    )}
                >
                    {label}
                </p>
            </div>
            <p className="mt-2 truncate text-sm font-bold text-foreground">
                {value}
            </p>
        </div>
    );
}
