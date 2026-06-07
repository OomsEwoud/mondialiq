import type { ReactNode } from 'react';

interface Props {
    icon: ReactNode;
    label: string;
    value: string;
}

export default function TeamInfoItem({ icon, label, value }: Props) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-3 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">{label}</p>
                <p className="truncate text-sm font-bold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}
