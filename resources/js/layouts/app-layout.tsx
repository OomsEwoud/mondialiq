import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app/app-logo';
import Footer from '@/components/footer/footer';
import NavApp from '@/components/navigation/nav-app';
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from '@/components/ui/display/avatar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);

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
                        <Avatar className="h-10 w-10 border-2 border-slate-200">
                            <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt="User"
                            />
                            <AvatarFallback className="bg-slate-100 text-slate-600">
                                EK
                            </AvatarFallback>
                        </Avatar>
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
