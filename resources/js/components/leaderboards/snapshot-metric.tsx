import type { LucideIcon } from 'lucide-react';

type SnapshotMetricProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    helper?: string;
};

export default function SnapshotMetric({
    icon: Icon,
    label,
    value,
    helper,
}: SnapshotMetricProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500">
                <Icon className="size-4 text-slate-600" />
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
