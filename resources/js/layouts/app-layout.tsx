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
import { UserMenuContent } from '@/components/user/user-menu-content';
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
            <header className="sticky top-0 z-50 border-b border-[#262c29] bg-[#0b0e0d]/95 backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
                    <Link
                        href={dashboard()}
                        className="group flex shrink-0 items-center rounded-lg focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e0d] focus-visible:outline-none"
                    >
                        <AppLogo
                            textClassName="text-base text-[#f3f4f1] [&_span]:text-[#70b98e] sm:text-lg"
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
                                        className="rounded-full focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e0d] focus-visible:outline-none"
                                        aria-label="Open user menu"
                                    >
                                        <Avatar className="h-9 w-9 border border-[#343b37]">
                                            <AvatarImage
                                                src={
                                                    auth.user.avatar ??
                                                    undefined
                                                }
                                                alt={auth.user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-[#171c19] text-[#daddd9]">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-64 rounded-xl border border-[#303732] bg-[#111513] p-2 text-[#daddd9] shadow-2xl shadow-black/30"
                                    align="end"
                                >
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <AppLoginButton className="focus-visible:ring-offset-slate-900" />
                        )}
                        <MobileNavigation />
                    </div>
                </div>
            </header>
            <main
                id="main-content"
                tabIndex={-1}
                className="mx-auto w-full max-w-7xl min-w-0 px-4 py-7 sm:px-8 sm:py-9"
            >
                {children}
            </main>
            <AppFooter />
        </div>
    );
}
