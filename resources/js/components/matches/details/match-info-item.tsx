import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    className?: string;
}

export default function MatchInfoItem({ icon, label, value, className }: Props) {
    return (
        <div className={cn("flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm", className)}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    {label}
                </p>
                {typeof value === 'string' ? (
                    <p
                        className="truncate text-sm font-semibold text-slate-800"
                        title={value}
                    >
                        {value}
                    </p>
                ) : (
                    <div className="text-sm font-semibold text-slate-800">
                        {value}
                    </div>
                )}
            </div>
        </div>
    );
}
