import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    LayoutGrid,
    Sparkles,
    TableProperties,
    BarChart3,
} from 'lucide-react';

import CompetitionsController from '@/actions/App/Http/Controllers/Pages/CompetitionsController';
import AppHeaderDesktopNav from '@/components/app/app-header-desktop-nav';
import AppHeaderMobileNav from '@/components/app/app-header-mobile-nav';
import AppLoginButton from '@/components/app/app-login-button';
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
import { home, leaderboards, matches, predictions } from '@/routes';
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

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const user = auth.user;
    const showBreadcrumbs = breadcrumbs.length > 1;

    return (
        <>
            <div className="-xl sticky top-0 z-40 border-b border-white/10 bg-secondary/95 shadow-sm">
                <div className="mx-auto flex h-16 items-center px-4 sm:px-6 md:max-w-7xl lg:px-8">
                    <AppHeaderMobileNav items={navigationItems} />

                    <Link
                        href={home()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo textClassName="text-foreground" />
                    </Link>

                    <AppHeaderDesktopNav items={navigationItems} />

                    <div className="ml-auto flex items-center space-x-2">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1 text-foreground hover:bg-card/10 focus-visible:ring-ring"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full ring-2 ring-ring/40">
                                            <AvatarImage
                                                src={user.avatar ?? undefined}
                                                alt={user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="rounded-lg bg-accent text-foreground">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-64 rounded-xl border-border bg-card p-2 text-foreground shadow-sm"
                                    align="end"
                                >
                                    <UserMenuContent user={user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <AppLoginButton />
                        )}
                    </div>
                </div>
            </div>
            {showBreadcrumbs && (
                <div className="-xl flex w-full border-b border-border/80 bg-card/80">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-muted-foreground sm:px-6 md:max-w-7xl lg:px-8">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
