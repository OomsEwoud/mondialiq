import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    LayoutGrid,
    Sparkles,
    TableProperties,
    BarChart3,
} from 'lucide-react';
import CompetitionsController from '@/actions/App/Http/Controllers/Pages/CompetitionsController';
import AppLogo from '@/components/app/app-logo';
import { NavMain } from '@/components/navigation/nav-main';
import { NavUser } from '@/components/navigation/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/navigation/sidebar';
import { home, leaderboards, matches, predictions } from '@/routes';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: home(),
        icon: LayoutGrid,
    },
    {
        title: 'Matches',
        href: matches(),
        icon: CalendarDays,
    },
    {
        title: 'AI Predictions',
        href: predictions(),
        icon: Sparkles,
    },
    {
        title: 'Competitions',
        href: CompetitionsController.url(),
        icon: TableProperties,
    },
    {
        title: 'AI Performance',
        href: leaderboards(),
        icon: BarChart3,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={home()} prefetch>
                                <AppLogo showText />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={sidebarNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
