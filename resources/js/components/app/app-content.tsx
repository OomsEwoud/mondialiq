import * as React from 'react';
import { SidebarInset } from '@/components/ui/navigation/sidebar';
import { cn } from '@/lib/utils';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'main'> & {
    variant?: AppVariant;
};

export function AppContent({
    variant = 'sidebar',
    children,
    className,
    ...props
}: Props) {
    const isSidebarVariant = variant === 'sidebar';

    if (isSidebarVariant) {
        return <SidebarInset {...props}>{children}</SidebarInset>;
    }

    return (
        <main
            className={cn(
                'mq-container flex h-full flex-1 flex-col gap-5 py-6',
                className,
            )}
            {...props}
        >
            {children}
        </main>
    );
}
