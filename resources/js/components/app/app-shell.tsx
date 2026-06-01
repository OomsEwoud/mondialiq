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
            <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.16),transparent_34rem),linear-gradient(180deg,#f8fafc_0%,#eef6fb_44%,#f8fafc_100%)] text-slate-950">
                <div className="flex min-h-screen w-full flex-col">
                    {children}
                </div>
            </div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
