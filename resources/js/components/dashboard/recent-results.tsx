import { Link } from '@inertiajs/react';

import EmptyState from '@/components/dashboard/empty-state';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { show as showMatch } from '@/routes/matches';
import type { Match } from '@/types/match';

export default function RecentResults({ matches }: { matches: Match[] }) {
    return (
        <section>
            <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-primary uppercase">
                    Modeltransparantie
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-foreground">
                    Zo deed MondialiQ het
                </h2>
            </div>
            {matches.length > 0 ? (
                <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle sm:grid-cols-2">
                    {matches.map((match) => (
                        <Link
                            key={match.id}
                            href={showMatch(match.id)}
                            className="bg-surface p-5 transition hover:bg-surface-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <TeamLogo
                                        src={match.homeTeamLogo}
                                        name={match.homeTeam}
                                    />
                                    <span className="truncate text-sm font-semibold text-foreground">
                                        {match.homeTeam} — {match.awayTeam}
                                    </span>
                                    <TeamLogo
                                        src={match.awayTeamLogo}
                                        name={match.awayTeam}
                                    />
                                </div>
                                <strong className="shrink-0 text-lg text-foreground tabular-nums">
                                    {match.score.fulltime.home ?? '—'}–
                                    {match.score.fulltime.away ?? '—'}
                                </strong>
                            </div>
                            <p className="mt-3 text-xs text-text-muted">
                                AI voorspelde{' '}
                                <strong className="text-text-secondary">
                                    {score(match.aiPrediction?.homeScore)}–
                                    {score(match.aiPrediction?.awayScore)}
                                </strong>
                            </p>
                            <span
                                className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[0.65rem] font-semibold ${performance(match).className}`}
                            >
                                {performance(match).label}
                            </span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="mt-6">
                    <EmptyState
                        title="Nog geen recente resultaten"
                        description="Er zijn nog geen afgelopen wedstrijden om met de AI-voorspellingen te vergelijken. Afgeronde wedstrijden verschijnen hier automatisch."
                    />
                </div>
            )}
        </section>
    );
}

function performance(match: Match) {
    const predictedHome = match.aiPrediction?.homeScore;
    const predictedAway = match.aiPrediction?.awayScore;
    const actualHome = match.score.fulltime.home;
    const actualAway = match.score.fulltime.away;

    if (
        predictedHome === null ||
        predictedHome === undefined ||
        predictedAway === null ||
        predictedAway === undefined ||
        actualHome === null ||
        actualAway === null
    ) {
        return {
            label: 'Nog niet beoordeeld',
            className: 'border-border-strong text-text-muted',
        };
    }

    if (predictedHome === actualHome && predictedAway === actualAway) {
        return {
            label: 'Exact correct',
            className: 'border-primary/25 text-positive',
        };
    }

    const predictedOutcome = Math.sign(predictedHome - predictedAway);
    const actualOutcome = Math.sign(actualHome - actualAway);

    if (predictedOutcome === actualOutcome) {
        return {
            label:
                actualOutcome === 0 ? 'Gelijkspel correct' : 'Winnaar correct',
            className: 'border-border-strong text-text-secondary',
        };
    }

    return {
        label: 'Onjuist',
        className: 'border-[#443a36] text-[#ad9890]',
    };
}

function TeamLogo({ src, name }: { src: string; name: string }) {
    return (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-crest-surface p-1">
            <ImageWithFallback
                src={src}
                alt=""
                className="size-full object-contain"
            />
            <span className="sr-only">{name}</span>
        </span>
    );
}

function score(value?: number | null) {
    return value === null || value === undefined ? '—' : Math.round(value);
}
