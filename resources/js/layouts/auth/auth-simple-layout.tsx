import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AppLogo from '@/components/app/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-background font-sans text-foreground selection:bg-[#36a96b]/30">
            <header className="border-b border-border-subtle bg-background/95 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
                    <Link
                        href={home()}
                        className="group rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label="MondialiQ home"
                    >
                        <AppLogo
                            markClassName="size-8 rounded-lg shadow-none transition-transform group-hover:scale-105"
                            textClassName="text-lg text-foreground [&_span]:text-primary"
                        />
                    </Link>
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-surface-interactive hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" />
                        <span className="hidden sm:inline">
                            Terug naar home
                        </span>
                        <span className="sm:hidden">Terug</span>
                    </Link>
                </div>
            </header>

            <main className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(54,169,107,0.07),transparent_30%)]" />
                <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center px-5 py-10 sm:px-8 sm:py-16">
                    <section className="w-full max-w-lg">
                        <div className="mb-8 text-center sm:mb-10">
                            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-primary uppercase">
                                MondialiQ
                            </p>
                            <h1 className="mt-3 text-3xl leading-tight font-black tracking-[-0.04em] text-foreground sm:text-4xl">
                                {title}
                            </h1>
                            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
                                {description}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border-strong bg-surface p-5 shadow-2xl shadow-black/20 sm:p-8">
                            {children}
                        </div>
                        <p className="mt-6 text-center text-xs leading-5 text-text-muted">
                            MondialiQ is gratis en gemaakt voor voetbalfans.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
