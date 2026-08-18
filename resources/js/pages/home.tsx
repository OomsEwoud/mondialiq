import { Link } from '@inertiajs/react';

import AccuracySection from '@/components/home/accuracy-section';
import CompetitionsSection from '@/components/home/competitions-section';
import FaqSection from '@/components/home/faq-section';
import HowItWorksSection from '@/components/home/how-it-works-section';
import MatchAnalysisSection from '@/components/home/match-analysis-section';
import PredictionPreview from '@/components/home/prediction-preview';
import PublicHeader from '@/components/home/public-header';
import PageHead from '@/components/seo/page-head';
import { matches, predictions } from '@/routes';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0b0e0d] font-sans text-[#f3f4f1] selection:bg-[#36a96b]/30">
            <PageHead
                title="MondialiQ - Voetbal voorspeld door data"
                description="Ontdek AI-voorspellingen, winstkansen en wedstrijdanalyses voor de competities die jij volgt."
            />
            <PublicHeader />
            <main>
                <section className="relative overflow-hidden border-b border-[#262c29]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(54,169,107,0.08),transparent_30%)]" />
                    <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-20 lg:py-32">
                        <div>
                            <div className="inline-flex items-center gap-2.5 text-[0.68rem] font-semibold tracking-[0.18em] text-[#aeb5b0] uppercase">
                                <span className="size-1.5 rounded-full bg-[#36a96b]" />
                                AI football intelligence · Seizoen 2026/27
                            </div>
                            <h1 className="mt-7 max-w-3xl text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] font-black tracking-[-0.065em] text-balance">
                                Zie wat de cijfers verwachten{' '}
                                <span className="text-[#9ebaa9]">
                                    vóór de aftrap.
                                </span>
                            </h1>
                            <p className="mt-7 max-w-xl text-base leading-7 text-[#949d97] sm:text-lg sm:leading-8">
                                MondialiQ analyseert vorm, kansen en
                                wedstrijddata om de meest waarschijnlijke
                                uitslag te tonen — met heldere context bij elke
                                voorspelling.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={predictions()}
                                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#f3f4f1] px-6 text-sm font-bold text-[#0b0e0d] transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e0d] focus-visible:outline-none active:translate-y-px"
                                >
                                    Ontdek alle predictions
                                </Link>
                                <Link
                                    href={matches()}
                                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#343b37] bg-[#111513] px-6 text-sm font-semibold text-[#d7dad7] transition hover:border-[#4a534e] hover:bg-[#171c19] focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e0d] focus-visible:outline-none active:translate-y-px"
                                >
                                    Bekijk wedstrijden
                                </Link>
                            </div>
                            <dl className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-[#262c29] pt-5 text-sm">
                                {(
                                    [
                                        ['13', 'competities'],
                                        ['', 'Dagelijkse AI-updates'],
                                        ['', 'Geen gokken'],
                                    ] as const
                                ).map(([value, label]) => (
                                    <div key={label} className="flex gap-1.5">
                                        {value && (
                                            <dd className="font-semibold text-[#daddd9]">
                                                {value}
                                            </dd>
                                        )}
                                        <dt className="text-[#68706b]">
                                            {label}
                                        </dt>
                                    </div>
                                ))}
                            </dl>
                        </div>
                        <PredictionPreview />
                    </div>
                </section>
                <section className="border-b border-[#262c29] bg-[#0e1210] px-5 py-5 sm:px-8">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.68rem] font-semibold tracking-[0.12em] text-[#7f8882] uppercase sm:justify-between">
                        <span>Wedstrijdanalyse vóór aftrap</span>
                        <span>Vorm · xG · kansen</span>
                        <span>Confidence met context</span>
                        <span>Resultaten transparant gevolgd</span>
                    </div>
                </section>
                <HowItWorksSection />
                <MatchAnalysisSection />
                <CompetitionsSection />
                <AccuracySection />
                <FaqSection />
                <section className="border-t border-[#262c29] px-5 py-20 text-center sm:px-8 sm:py-28">
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#7d857f] uppercase">
                        Analyse vóór de aftrap
                    </p>
                    <h2 className="mx-auto mt-5 max-w-3xl text-4xl leading-tight font-black tracking-[-0.04em] sm:text-6xl">
                        MondialiQ — Voetbal voorspeld door data.
                    </h2>
                    <p className="mt-5 text-sm text-[#949d97]">
                        Volg AI-voorspellingen, statistieken en analyses voor
                        jouw favoriete competities.
                    </p>
                    <Link
                        href={predictions()}
                        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#f3f4f1] px-7 text-sm font-bold text-[#0b0e0d] transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e0d] focus-visible:outline-none active:translate-y-px"
                    >
                        Ontdek de predictions
                    </Link>
                </section>
            </main>
            <footer className="border-t border-[#262c29] px-5 py-8 sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-[#68706b] sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-[#949d97]">
                        MondialiQ
                    </span>
                    <span>
                        © {new Date().getFullYear()} · AI-inzichten voor
                        voetbalfans
                    </span>
                </div>
            </footer>
        </div>
    );
}
