import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh items-center justify-center bg-slate-50 px-4 py-8 text-blue-950">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Link
                        href={home()}
                        className="group inline-flex"
                        aria-label="MondialIQ home"
                    >
                        <AppLogo markClassName="transition-transform group-hover:scale-105" />
                    </Link>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-7 text-center">
                        <h1 className="text-2xl font-black tracking-tight">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
