import { Link } from '@inertiajs/react';

import AppLogo from '@/components/app/app-logo';
import { home, login, register } from '@/routes';

export default function PublicHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-border-subtle/90 bg-background/90 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
                <Link
                    href={home()}
                    aria-label="MondialiQ home"
                    className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <AppLogo
                        markClassName="size-8 rounded-lg shadow-none"
                        textClassName="text-base text-foreground [&_span]:text-primary sm:text-lg"
                    />
                </Link>
                <nav
                    aria-label="Account"
                    className="flex items-center gap-1.5 sm:gap-3"
                >
                    <Link
                        href={login()}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-[#b4bbb6] transition hover:bg-surface-interactive hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-4"
                    >
                        Inloggen
                    </Link>
                    <Link
                        href={register()}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg bg-crest-surface px-3.5 text-sm font-bold text-background transition hover:bg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:translate-y-px sm:px-4"
                    >
                        <span className="sm:hidden">Start</span>
                        <span className="hidden sm:inline">Account maken</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
