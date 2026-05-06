import { Link } from '@inertiajs/react';
import NavApp from '@/components/navigation/nav-app';
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from '@/components/ui/display/avatar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="light min-h-screen bg-slate-50 font-sans text-slate-900">
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-100 bg-white px-8 py-4">
                <Link href="/" className="group flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-xl font-black text-white shadow-lg shadow-rose-200 transition-transform group-hover:scale-105">
                        MI
                    </div>
                    <span className="ml-3 text-xl font-black tracking-tight text-slate-800">
                        Mondial<span className="text-rose-600">IQ</span>
                    </span>
                </Link>
                <NavApp />
                <Avatar className="h-10 w-10 border-2 border-slate-200">
                    <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="User"
                    />
                    <AvatarFallback className="bg-slate-100 text-slate-600">
                        EK
                    </AvatarFallback>
                </Avatar>
            </header>

            <main>{children}</main>
        </div>
    );
}
