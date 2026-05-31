import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu, Search } from 'lucide-react';

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
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/overlays/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import { UserMenuContent } from '@/components/user/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn, toUrl } from '@/lib/utils';
import { home, login } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: home(),
        icon: LayoutGrid,
    },
];

const externalNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

const externalNavButtonClassName =
    'group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';

function AppHeaderMobileNav() {
    return (
        <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 h-[34px] w-[34px]"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                >
                    <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                    <SheetHeader className="flex justify-start text-left">
                        <AppLogo textClassName="text-sidebar-foreground" />
                    </SheetHeader>
                    <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                        <div className="flex h-full flex-col justify-between text-sm">
                            <div className="flex flex-col space-y-4">
                                {mainNavItems.map((item) => (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="flex items-center space-x-2 font-medium"
                                    >
                                        {item.icon && <item.icon className="h-5 w-5" />}
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </div>

                            <div className="flex flex-col space-y-4">
                                {externalNavItems.map((item) => (
                                    <a
                                        key={item.title}
                                        href={toUrl(item.href)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 font-medium"
                                    >
                                        {item.icon && <item.icon className="h-5 w-5" />}
                                        <span>{item.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

function AppHeaderDesktopNav() {
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    return (
        <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
            <NavigationMenu className="flex h-full items-stretch">
                <NavigationMenuList className="flex h-full items-stretch space-x-2">
                    {mainNavItems.map((item) => (
                        <NavigationMenuItem
                            key={item.title}
                            className="relative flex h-full items-center"
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    whenCurrentUrl(item.href, activeItemStyles),
                                    'h-9 cursor-pointer px-3',
                                )}
                            >
                                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                {item.title}
                            </Link>
                            {isCurrentUrl(item.href) && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white" />
                            )}
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}

function AppHeaderExternalLinks() {
    return (
        <div className="ml-1 hidden gap-1 lg:flex">
            {externalNavItems.map((item) => (
                <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                        <a
                            href={toUrl(item.href)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={externalNavButtonClassName}
                        >
                            <span className="sr-only">{item.title}</span>
                            {item.icon && (
                                <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                            )}
                        </a>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{item.title}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
        </div>
    );
}

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const user = auth.user;
    const showBreadcrumbs = breadcrumbs.length > 1;

    return (
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <AppHeaderMobileNav />

                    <Link
                        href={home()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    <AppHeaderDesktopNav />

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group h-9 w-9 cursor-pointer"
                            >
                                <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                            </Button>
                            <AppHeaderExternalLinks />
                        </div>
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={user.avatar ?? undefined}
                                                alt={user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
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
                            <Button asChild className="h-9 rounded-md px-4">
                                <Link href={login()}>Inloggen</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            {showBreadcrumbs && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
