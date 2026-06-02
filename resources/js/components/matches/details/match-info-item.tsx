import type { ReactNode } from 'react';

interface Props {
    icon: ReactNode;
    label: string;
    value: string;
}

export default function MatchInfoItem({ icon, label, value }: Props) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-cyan-100/70 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] p-3 shadow-sm shadow-cyan-950/5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-[11px] font-black tracking-[0.16em] text-slate-400 uppercase">
                    {label}
                </p>
                <p
                    className="line-clamp-2 text-sm font-black text-slate-800"
                    title={value}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}
