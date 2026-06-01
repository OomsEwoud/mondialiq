import type { ReactNode } from 'react';

interface Props {
    icon: ReactNode;
    label: string;
    value: string;
}

export default function MatchInfoItem({ icon, label, value }: Props) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-[11px] font-black tracking-wide text-slate-400 uppercase">
                    {label}
                </p>
                <p
                    className="line-clamp-2 text-sm font-bold text-slate-800"
                    title={value}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}
