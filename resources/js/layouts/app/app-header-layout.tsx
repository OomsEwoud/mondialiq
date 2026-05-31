import { AppContent } from '@/components/app/app-content';
import { AppHeader } from '@/components/app/app-header';
import { AppShell } from '@/components/app/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent variant="header" className="px-4 py-6 md:px-6">
                {children}
            </AppContent>
        </AppShell>
    );
}
