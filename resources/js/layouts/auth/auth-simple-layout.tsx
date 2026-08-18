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
        <div className="min-h-svh bg-[#0b0e0d] font-sans text-[#f3f4f1] selection:bg-[#36a96b]/30">
            <header className="border-b border-[#262c29]">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
                    <Link
                        href={home()}
                        className="group rounded-lg focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:outline-none"
                        aria-label="MondialiQ home"
                    >
                        <AppLogo
                            markClassName="size-8 rounded-lg shadow-none transition-transform group-hover:scale-105"
                            textClassName="text-lg text-[#f3f4f1] [&_span]:text-[#70b98e]"
                        />
                    </Link>
                    <Link
                        href={home()}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-[#949d97] transition hover:bg-[#171c19] hover:text-white focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:outline-none"
                    >
                        Terug naar home
                    </Link>
                </div>
            </header>
            <main className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(54,169,107,0.07),transparent_32%)]" />
                <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center">
                    <section className="w-full px-5 py-10 sm:px-8 sm:py-16 lg:py-20">
                        <div className="mx-auto w-full max-w-md">
                            <div className="mb-8">
                                <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-[#6fae88] uppercase">
                                    Veilige accounttoegang
                                </p>
                                <h1 className="mt-4 text-3xl leading-tight font-black tracking-[-0.04em] text-white sm:text-4xl">
                                    {title}
                                </h1>
                                <p className="mt-3 max-w-sm text-sm leading-6 text-[#949d97]">
                                    {description}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-[#303732] bg-[#111513] p-5 shadow-2xl shadow-black/20 sm:p-7">
                                {children}
                            </div>
                            <p className="mt-6 text-center text-xs leading-5 text-[#68706b]">
                                Je gegevens worden beveiligd verwerkt. MondialiQ
                                slaat nooit wachtwoorden leesbaar op.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
