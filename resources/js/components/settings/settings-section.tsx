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
    title,
    description,
    children,
}: Props) {
    return (
        <section className={settingsSectionClassName}>
            <div className="mb-5">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {children}
        </section>
    );
}
