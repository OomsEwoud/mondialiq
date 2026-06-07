import type { ReactNode } from 'react';

interface Props {
    icon: ReactNode;
    label: string;
    value: string;
}

export default function MatchInfoItem({ icon, label, value }: Props) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-slate-600 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                    {label}
                </p>
                <p
                    className="line-clamp-2 text-sm font-semibold text-slate-800"
                    title={value}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}
