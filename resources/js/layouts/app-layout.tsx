import { Link, usePage } from '@inertiajs/react';
import AppFooter from '@/components/app/app-footer';

import AppLoginButton from '@/components/app/app-login-button';
import AppLogo from '@/components/app/app-logo';
import MobileNavigation from '@/components/app/mobile-navigation';
import NavApp from '@/components/navigation/nav-app';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/forms/dropdown-menu';
import {
    accountMenuClassName,
    UserMenuContent,
} from '@/components/user/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props;
    const getInitials = useInitials();

    return (
        <div className="flex min-h-screen w-full flex-col bg-background font-sans text-foreground">
            <a
                href="#main-content"
                className="sr-only fixed top-3 left-3 z-[100] rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only"
            >
                Naar inhoud
            </a>
            <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/95 backdrop-blur-xl">
                <div className="mq-container flex h-16 items-center justify-between gap-3">
                    <Link
                        href={dashboard()}
                        className="group flex shrink-0 items-center rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                    >
                        <AppLogo
                            textClassName="text-base text-foreground [&_span]:text-primary sm:text-lg"
                            markClassName="size-8 rounded-lg shadow-none transition-transform group-hover:scale-105"
                        />
                    </Link>
                    <NavApp className="hidden lg:flex" />
                    <div className="flex items-center gap-2 sm:gap-3">
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                                        aria-label="Open user menu"
                                    >
                                        <Avatar className="h-9 w-9 border border-border-strong">
                                            <AvatarImage
                                                src={
                                                    auth.user.avatar ??
                                                    undefined
                                                }
                                                alt={auth.user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-surface-interactive text-foreground">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className={accountMenuClassName}
                                    align="end"
                                >
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <AppLoginButton className="focus-visible:ring-offset-background" />
                        )}
                        <MobileNavigation />
                    </div>
                </div>
            </header>
            <main
                id="main-content"
                tabIndex={-1}
                className="mq-container mq-page-content min-w-0"
            >
                {children}
            </main>
            <AppFooter />
        </div>
    );
}
