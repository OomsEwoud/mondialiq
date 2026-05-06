import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
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
                <div className="flex items-center justify-between px-6 py-4">
                    <Link href="/" className="group flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-xl font-black text-blue-950 shadow-lg shadow-blue-900 transition-transform group-hover:scale-105">
                            MI
                        </div>
                        <span className="ml-3 text-xl font-black tracking-tight text-white hidden sm:inline">
                            Mondial<span className="text-cyan-400">IQ</span>
                        </span>
                    </Link>
                    <div className="hidden md:flex">
                        <NavApp />
                    </div>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-slate-200">
                            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                            <AvatarFallback className="bg-slate-100 text-slate-600">EK</AvatarFallback>
                        </Avatar>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden text-blue-200 hover:text-cyan-400 transition-colors"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <div className="md:hidden border-t border-blue-800 bg-[#1a237e] px-6 py-3">
                        <NavApp onNavigate={() => setMenuOpen(false)} />
                    </div>
                )}
            </header>
            <main>{children}</main>
        </div>
    );
}