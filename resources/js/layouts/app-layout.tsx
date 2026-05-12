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
        <div className="light min-h-screen bg-slate-50 font-sans text-slate-900">
            <header className="sticky top-0 z-50 border-b border-blue-900 bg-[#1a237e]">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                    <Link href="/" className="group flex items-center">
                        <AppLogo
                            textClassName="hidden text-white sm:inline"
                            markClassName="transition-transform group-hover:scale-105"
                        />
                    </Link>
                    <div className="hidden items-center gap-6 md:flex">
                        <NavApp />
                    </div>
                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="rounded-full focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                                        aria-label="Open user menu"
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-slate-200">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
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
                                className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-black text-blue-950 transition-colors hover:bg-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                            >
                                Inloggen
                            </Link>
                        )}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-blue-200 transition-colors hover:text-cyan-400 md:hidden"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <div className="border-t border-blue-800 bg-[#1a237e] px-6 py-3 md:hidden">
                        <NavApp onNavigate={() => setMenuOpen(false)} />
                    </div>
                )}
            </header>
            <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
            <Footer />
        </div>
    );
}
