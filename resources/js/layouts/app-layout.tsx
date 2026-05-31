import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
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
import { login } from '@/routes';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { auth } = usePage().props;
    const getInitials = useInitials();

    return (
        <div className="light min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans text-slate-900">
            <header className="sticky top-0 z-50 border-b border-cyan-200/10 bg-[#141c69] shadow-lg shadow-blue-950/10">
                <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
                    <Link
                        href="/"
                        className="group flex shrink-0 items-center rounded-full focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141c69] focus-visible:outline-none"
                    >
                        <AppLogo
                            textClassName="hidden text-white sm:inline"
                            markClassName="transition-transform group-hover:scale-105"
                        />
                    </Link>
                    <div className="hidden flex-1 items-center justify-center md:flex">
                        <NavApp />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="rounded-full focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141c69] focus-visible:outline-none"
                                        aria-label="Open user menu"
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-slate-200">
                                            <AvatarImage
                                                src={
                                                    auth.user.avatar ??
                                                    undefined
                                                }
                                                alt={auth.user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-slate-100 text-slate-600">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-64 rounded-xl border-slate-200 bg-white p-2 text-slate-700 shadow-xl shadow-blue-950/10"
                                    align="end"
                                >
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                href={login()}
                                className="rounded-full bg-cyan-300 px-3.5 py-2 text-sm font-black text-blue-950 shadow-sm shadow-cyan-950/20 transition-colors duration-200 hover:bg-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141c69] focus-visible:outline-none sm:px-4"
                            >
                                Inloggen
                            </Link>
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
                            className="rounded-full p-2 text-blue-100 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141c69] focus-visible:outline-none md:hidden"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <div className="border-t border-white/10 bg-[#141c69] px-4 py-2.5 md:hidden">
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
