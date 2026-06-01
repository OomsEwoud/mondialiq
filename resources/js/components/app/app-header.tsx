import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    LayoutGrid,
    Sparkles,
    TableProperties,
    Trophy,
} from 'lucide-react';

import AppHeaderDesktopNav from '@/components/app/app-header-desktop-nav';
import AppHeaderMobileNav from '@/components/app/app-header-mobile-nav';
import AppLogo from '@/components/app/app-logo';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { Button } from '@/components/ui/forms/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/forms/dropdown-menu';
import { UserMenuContent } from '@/components/user/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import {
    groups,
    home,
    leaderboards,
    login,
    matches,
    predictions,
} from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const navigationItems: NavItem[] = [
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

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const user = auth.user;
    const showBreadcrumbs = breadcrumbs.length > 1;

    return (
        <>
            <div className="sticky top-0 z-40 border-b border-white/10 bg-blue-950/95 shadow-lg shadow-blue-950/10 backdrop-blur-xl">
                <div className="mx-auto flex h-16 items-center px-4 sm:px-6 md:max-w-7xl lg:px-8">
                    <AppHeaderMobileNav items={navigationItems} />

                    <Link
                        href={home()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo textClassName="text-white" />
                    </Link>

                    <AppHeaderDesktopNav items={navigationItems} />

                    <div className="ml-auto flex items-center space-x-2">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1 text-white hover:bg-white/10 focus-visible:ring-cyan-300"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full ring-2 ring-cyan-200/40">
                                            <AvatarImage
                                                src={user.avatar ?? undefined}
                                                alt={user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="rounded-lg bg-cyan-100 text-blue-950">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-64 rounded-xl border-slate-200 bg-white p-2 text-slate-700 shadow-xl shadow-blue-950/10"
                                    align="end"
                                >
                                    <UserMenuContent user={user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                asChild
                                className="h-9 rounded-full bg-cyan-300 px-4 font-black text-blue-950 shadow-sm shadow-cyan-950/20 hover:bg-cyan-200"
                            >
                                <Link href={login()}>Inloggen</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            {showBreadcrumbs && (
                <div className="flex w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-slate-500 sm:px-6 md:max-w-7xl lg:px-8">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
