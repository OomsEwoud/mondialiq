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
        <section className="overflow-hidden rounded-2xl border border-border-subtle/50 bg-surface shadow-lg">
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-8 xl:p-10">
                <div>
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border-subtle/50 bg-surface-interactive/80 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI football intelligence
                    </p>
                    <h1 className="max-w-3xl text-4xl leading-none font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                        <span className="block">Football, understood</span>
                        <span className="text-primary">prediction cockpit</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                        Track every fixture, compare AI signals with your own
                        football instincts and turn private leagues into a
                        tournament-long analytics race.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {insightBadges.map((badge) => (
                            <span
                                key={badge}
                                className="rounded-full border border-border-subtle/40 bg-surface-interactive/60 px-3 py-1 text-xs font-semibold text-text-secondary"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={matches()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                        >
                            View matches
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={predictions()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle/50 bg-surface-interactive/50 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-interactive/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Browse predictions
                        </Link>
                    </div>
                </div>

                <div className="rounded-2xl border border-border-subtle/50 bg-surface-interactive/40 p-3 shadow-sm sm:p-4">
                    <div className="rounded-xl border border-border-subtle/40 bg-surface/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                                    Model pulse
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-foreground">
                                    Matchday ready
                                </p>
                            </div>
                            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-subtle text-primary">
                                <ShieldCheck className="size-5" />
                            </span>
                        </div>
                        <div className="mt-5 grid grid-cols-3 gap-2">
                            {heroStats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-border-subtle/40 bg-surface-interactive/40 p-3"
                                >
                                    <p className="text-lg font-semibold text-foreground sm:text-xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold tracking-wide text-primary uppercase">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 rounded-xl border border-primary/20 bg-brand-subtle p-3">
                            <p className="text-sm font-semibold text-foreground">
                                Predictions are insights, not certainties.
                            </p>
                            <p className="mt-1 text-xs leading-5 text-text-muted">
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
