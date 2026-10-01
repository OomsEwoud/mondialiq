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
            <div className="mb-5 flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="size-5" />
                </span>
                <div>
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-foreground">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}
