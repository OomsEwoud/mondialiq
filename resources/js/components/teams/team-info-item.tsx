import type { ReactNode } from 'react';

interface Props {
    icon: ReactNode;
    label: string;
    value: string;
}

export default function TeamInfoItem({ icon, label, value }: Props) {
    return (
        <div className="flex min-h-20 items-center gap-3 bg-[#0d110f] p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#1b2b21] text-[#70b98e] [&_svg]:size-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#68716b] uppercase">
                    {label}
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-[#daddd9]">
                    {value}
                </p>
            </div>
        </div>
    );
}
