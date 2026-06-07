import { Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';

import { matches, predictions } from '@/routes';

const heroStats = [
    { label: 'Matches', value: '104' },
    { label: 'Teams', value: '48' },
    { label: 'Tournament window', value: 'June 11 - July 19' },
];

const insightBadges = ['AI confidence', 'Market signals', 'Private leagues'];

export default function HeroSection() {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg">
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-8 xl:p-10">
                <div>
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-600/50 bg-slate-800/80 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 uppercase shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI football intelligence
                    </p>
                    <h1 className="max-w-3xl text-4xl leading-none font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                        <span className="block">World Cup 2026</span>
                        <span className="bg-gradient-to-r from-cyan-300 to-sky-300 bg-clip-text text-transparent">
                            prediction cockpit
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                        Track every fixture, compare AI signals with your own
                        football instincts and turn private leagues into a
                        tournament-long analytics race.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {insightBadges.map((badge) => (
                            <span
                                key={badge}
                                className="rounded-full border border-slate-600/40 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={matches()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
                        >
                            View matches
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={predictions()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Browse predictions
                        </Link>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-3 shadow-sm  sm:p-4">
                    <div className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                                    Model pulse
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-white">
                                    Matchday ready
                                </p>
                            </div>
                            <span className="flex size-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                                <ShieldCheck className="size-5" />
                            </span>
                        </div>
                        <div className="mt-5 grid grid-cols-3 gap-2">
                            {heroStats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-3"
                                >
                                    <p className="text-lg font-semibold text-white sm:text-xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                            <p className="text-sm font-semibold text-cyan-50">
                                Predictions are insights, not certainties.
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                MondialIQ separates AI reads from your own picks
                                so every decision stays transparent.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
