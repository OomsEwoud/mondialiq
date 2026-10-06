import type { ReactNode } from 'react';

interface Props {
    icon: ReactNode;
    label: string;
    value: string;
}

export default function TeamInfoItem({ icon, label, value }: Props) {
    return (
        <div className="flex min-h-[4.5rem] min-w-0 items-center gap-2.5 rounded-lg border border-[#292e2b] bg-[#0d0f0e] p-3">
            <span className="flex size-8 shrink-0 items-center justify-center text-[#8b938e] [&_svg]:size-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-wide text-[#78827b] uppercase">
                    {label}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-[#e0e5e1]">
                    {value}
                </p>
            </div>
        </div>
    );
}
