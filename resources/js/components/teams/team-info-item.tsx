import type { ReactNode } from 'react';

interface Props {
    icon: ReactNode;
    label: string;
    value: string;
}

export default function TeamInfoItem({ icon, label, value }: Props) {
    return (
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="truncate text-sm font-bold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}
