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
        <section className="overflow-hidden rounded-2xl border border-cyan-200/20 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.24),transparent_26rem),linear-gradient(135deg,#0b1748_0%,#111f67_48%,#0e7490_140%)] shadow-2xl shadow-blue-950/20">
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-8 xl:p-10">
                <div>
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/12 px-3 py-1 text-xs font-black tracking-widest text-cyan-100 uppercase shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI football intelligence
                    </p>
                    <h1 className="max-w-3xl text-4xl leading-none font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                        <span className="block">World Cup 2026</span>
                        <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-200 bg-clip-text text-transparent">
                            prediction cockpit
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                        Track every fixture, compare AI signals with your own
                        football instincts and turn private leagues into a
                        tournament-long analytics race.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {insightBadges.map((badge) => (
                            <span
                                key={badge}
                                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black text-cyan-50"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={matches()}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-blue-950 shadow-md shadow-blue-950/20 transition-colors hover:bg-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141c69] focus-visible:outline-none"
                        >
                            View matches
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={predictions()}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-100/25 bg-white/5 px-5 py-3 text-sm font-black text-cyan-50 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141c69] focus-visible:outline-none"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Browse predictions
                        </Link>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/12 bg-white/10 p-3 shadow-xl shadow-blue-950/20 backdrop-blur sm:p-4">
                    <div className="rounded-2xl border border-white/10 bg-blue-950/35 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-black tracking-[0.18em] text-cyan-100 uppercase">
                                    Model pulse
                                </p>
                                <p className="mt-1 text-2xl font-black text-white">
                                    Matchday ready
                                </p>
                            </div>
                            <span className="flex size-11 items-center justify-center rounded-xl bg-cyan-300 text-blue-950">
                                <ShieldCheck className="size-5" />
                            </span>
                        </div>
                        <div className="mt-5 grid grid-cols-3 gap-2">
                            {heroStats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-white/10 bg-white/8 p-3"
                                >
                                    <p className="text-lg font-black text-white sm:text-xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-[10px] font-bold tracking-wider text-cyan-100/80 uppercase">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 rounded-xl border border-cyan-200/20 bg-cyan-300/10 p-3">
                            <p className="text-sm font-black text-cyan-50">
                                Predictions are insights, not certainties.
                            </p>
                            <p className="mt-1 text-xs leading-5 text-blue-100">
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
