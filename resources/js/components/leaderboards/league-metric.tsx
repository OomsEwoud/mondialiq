import type { LucideIcon } from 'lucide-react';

type Props = {
    icon: LucideIcon;
    label: string;
    value: string;
};

export default function LeagueMetric({ icon: Icon, label, value }: Props) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500">
                <Icon className="size-4 text-slate-600" />
                <p className="text-xs font-bold tracking-wide uppercase">
                    {label}
                </p>
            </div>
            <p className="mt-2 truncate text-sm font-bold text-slate-900">
                {value}
            </p>
        </div>
    );
}
