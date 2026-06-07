import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/navigation/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const isOpen = usePage().props.sidebarOpen;
    const isHeaderVariant = variant === 'header';

    if (isHeaderVariant) {
        return (
            <div className="min-h-screen w-full bg-slate-50 text-slate-950">
                <div className="flex min-h-screen w-full flex-col">
                    {children}
                </div>
            </div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
