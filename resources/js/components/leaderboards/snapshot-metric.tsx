import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type SnapshotMetricProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    helper?: string;
    iconClassName?: string;
    labelClassName?: string;
    className?: string;
};

export default function SnapshotMetric({
    icon: Icon,
    label,
    value,
    helper,
    iconClassName,
    labelClassName,
    className,
}: SnapshotMetricProps) {
    return (
        <div className={cn('rounded-2xl border px-4 py-4', className)}>
            <div className={cn('flex items-center gap-2 text-slate-500', labelClassName)}>
                <Icon
                    className={cn('size-4', iconClassName ?? 'text-slate-600')}
                />
                <p className="text-xs font-bold tracking-wide uppercase">
                    {label}
                </p>
            </div>
            <p className="mt-2 text-base leading-tight font-bold text-slate-900">
                {value}
            </p>
            {helper && (
                <p className="mt-1 text-xs font-semibold text-slate-500">
                    {helper}
                </p>
            )}
        </div>
    );
}
