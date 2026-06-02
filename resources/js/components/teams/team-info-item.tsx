import type { ReactNode } from 'react';

interface Props {
    icon: ReactNode;
    label: string;
    value: string;
}

export default function TeamInfoItem({ icon, label, value }: Props) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] p-3 shadow-sm shadow-cyan-950/5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-[11px] font-black tracking-[0.14em] text-slate-400 uppercase">{label}</p>
                <p className="truncate text-sm font-black text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}
