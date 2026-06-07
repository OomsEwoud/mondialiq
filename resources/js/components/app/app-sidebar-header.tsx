import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/navigation/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

type AppSidebarHeaderProps = {
    breadcrumbs?: BreadcrumbItemType[];
};

export function AppSidebarHeader({ breadcrumbs = [] }: AppSidebarHeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
