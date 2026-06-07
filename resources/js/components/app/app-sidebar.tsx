import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    LayoutGrid,
    Sparkles,
    TableProperties,
    Trophy,
} from 'lucide-react';
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
import { groups, home, leaderboards, matches, predictions } from '@/routes';
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
        title: 'Groups',
        href: groups(),
        icon: TableProperties,
    },
    {
        title: 'Predictions',
        href: predictions(),
        icon: Sparkles,
    },
    {
        title: 'Leaderboards',
        href: leaderboards(),
        icon: Trophy,
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
