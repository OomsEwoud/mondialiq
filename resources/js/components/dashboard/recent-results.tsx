import { Link } from '@inertiajs/react';

import EmptyState from '@/components/dashboard/empty-state';
import { show as showMatch } from '@/routes/matches';
import type { Match } from '@/types/match';

export default function RecentResults({ matches }: { matches: Match[] }) {
    return (
        <section>
            <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                    Modeltransparantie
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
                    Zo deed MondialiQ het
                </h2>
            </div>
            {matches.length > 0 ? (
                <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-[#262c29] bg-[#262c29] sm:grid-cols-2">
                    {matches.map((match) => (
                        <Link
                            key={match.id}
                            href={showMatch(match.id)}
                            className="bg-[#111513] p-5 transition hover:bg-[#141916] focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:outline-none focus-visible:ring-inset"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <TeamLogo
                                        src={match.homeTeamLogo}
                                        name={match.homeTeam}
                                    />
                                    <span className="truncate text-sm font-semibold text-[#daddd9]">
                                        {match.homeTeam} — {match.awayTeam}
                                    </span>
                                    <TeamLogo
                                        src={match.awayTeamLogo}
                                        name={match.awayTeam}
                                    />
                                </div>
                                <strong className="shrink-0 text-lg text-white tabular-nums">
                                    {match.score.fulltime.home ?? '—'}–
                                    {match.score.fulltime.away ?? '—'}
                                </strong>
                            </div>
                            <p className="mt-3 text-xs text-[#7f8882]">
                                AI voorspelde{' '}
                                <strong className="text-[#aeb5b0]">
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
            className: 'border-[#303732] text-[#7f8882]',
        };
    }

    if (predictedHome === actualHome && predictedAway === actualAway) {
        return {
            label: 'Exact correct',
            className: 'border-[#2b4636] text-[#8bc5a1]',
        };
    }

    const predictedOutcome = Math.sign(predictedHome - predictedAway);
    const actualOutcome = Math.sign(actualHome - actualAway);

    if (predictedOutcome === actualOutcome) {
        return {
            label:
                actualOutcome === 0 ? 'Gelijkspel correct' : 'Winnaar correct',
            className: 'border-[#39413c] text-[#aeb5b0]',
        };
    }

    return {
        label: 'Onjuist',
        className: 'border-[#443a36] text-[#ad9890]',
    };
}

function TeamLogo({ src, name }: { src: string; name: string }) {
    return (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#f3f4f1] p-1">
            <img src={src} alt="" className="size-full object-contain" />
            <span className="sr-only">{name}</span>
        </span>
    );
}

function score(value?: number | null) {
    return value === null || value === undefined ? '—' : Math.round(value);
}
