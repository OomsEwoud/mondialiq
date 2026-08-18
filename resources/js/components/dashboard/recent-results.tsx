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
                    Recente resultaten
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
                                <span className="truncate text-sm font-semibold text-[#daddd9]">
                                    {match.homeTeam} — {match.awayTeam}
                                </span>
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

function score(value?: number | null) {
    return value === null || value === undefined ? '—' : Math.round(value);
}
