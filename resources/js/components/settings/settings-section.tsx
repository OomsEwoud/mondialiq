import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
    icon: LucideIcon;
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
}

export default function SettingsSection({
    icon: Icon,
    eyebrow,
    title,
    description,
    children,
}: Props) {
    return (
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-blue-950">
                        <Icon className="size-5" />
                    </span>
                    <div>
                        <p className="mb-1 text-xs font-black tracking-widest text-cyan-500 uppercase">
                            {eyebrow}
                        </p>
                        <h2 className="text-xl font-black tracking-tight text-blue-950">
                            {title}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
            {children}
        </section>
    );
}
