import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { settingsSectionClassName } from '@/utils/settings-ui';

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
        <section className={settingsSectionClassName}>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3 sm:gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-slate-200 sm:size-12">
                        <Icon className="size-5" />
                    </span>
                    <div>
                        <p className="mb-1 text-xs font-bold tracking-wide text-slate-600 uppercase">
                            {eyebrow}
                        </p>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
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
