import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import AppLoginButton from '@/components/app/app-login-button';
import AppLogo from '@/components/app/app-logo';
import Footer from '@/components/footer/footer';
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { auth } = usePage().props;
    const getInitials = useInitials();

    return (
        <div className="light min-h-screen w-full overflow-x-hidden bg-white font-sans text-slate-900">
            <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900 shadow-sm">
                <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
                    <Link
                        href="/"
                        className="group flex shrink-0 items-center rounded-full focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
                    >
                        <AppLogo
                            textClassName="hidden text-white sm:inline"
                            markClassName="transition-transform group-hover:scale-105"
                        />
                    </Link>
                    <NavApp />
                    <div className="flex items-center gap-2 sm:gap-3">
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="rounded-full focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
                                        aria-label="Open user menu"
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-slate-600">
                                            <AvatarImage
                                                src={
                                                    auth.user.avatar ??
                                                    undefined
                                                }
                                                alt={auth.user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-slate-700 text-slate-200">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                                    align="end"
                                >
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <AppLoginButton className="focus-visible:ring-offset-slate-900" />
                        )}
                        <button
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-expanded={menuOpen}
                            aria-label={
                                menuOpen
                                    ? 'Close navigation menu'
                                    : 'Open navigation menu'
                            }
                            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none md:hidden"
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <div className="border-t border-slate-700/50 bg-slate-900 px-4 py-2.5 md:hidden">
                        <div className="mx-auto w-full max-w-5xl">
                            <NavApp onNavigate={() => setMenuOpen(false)} />
                        </div>
                    </div>
                )}
            </header>
            <main className="mx-auto w-full max-w-5xl min-w-0 px-6 py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}
