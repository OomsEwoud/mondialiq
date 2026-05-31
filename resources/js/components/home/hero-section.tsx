import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';

import { matches, predictions } from '@/routes';

const heroStats = [
    { label: 'Matches', value: '104' },
    { label: 'Teams', value: '48' },
    { label: 'Tournament window', value: 'June 11 - July 19' },
];

export default function HeroSection() {
    return (
        <section className="overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#141c69] shadow-xl shadow-blue-950/15">
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-10">
                <div>
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-black tracking-widest text-cyan-100 uppercase">
                        <Sparkles className="h-3.5 w-3.5" />
                        World Cup
                    </p>
                    <h1 className="max-w-3xl text-5xl leading-none font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                        <span className="block">World Cup</span>
                        <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-200 bg-clip-text text-transparent">
                            2026
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                        Track all matches, explore AI-powered predictions and
                        compete with other fans on the leaderboard.
                    </p>
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
                            className="inline-flex items-center justify-center rounded-full border border-cyan-100/25 bg-white/5 px-5 py-3 text-sm font-black text-cyan-50 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141c69] focus-visible:outline-none"
                        >
                            Browse predictions
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur sm:gap-3 sm:p-4 lg:grid-cols-1">
                    {heroStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-white/10 bg-blue-950/25 p-3 text-center sm:p-4 lg:text-left"
                        >
                            <p className="text-lg font-black text-white sm:text-2xl">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-[10px] font-bold tracking-wider text-cyan-100/80 uppercase sm:text-xs">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
