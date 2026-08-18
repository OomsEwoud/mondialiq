import { Link } from '@inertiajs/react';

import EmptyState from '@/components/dashboard/empty-state';
import { show as showMatch } from '@/routes/matches';
import type { LiveFixture } from '@/types/live-fixture';
import { getLiveStatusLabel } from '@/utils/match-status';

export default function LivePanel({ matches }: { matches: LiveFixture[] }) {
    return (
        <section>
            <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#57ad78]" />
                <h2 className="text-xl font-bold text-white">Live</h2>
            </div>
            {matches.length === 0 ? (
                <div className="mt-5">
                    <EmptyState
                        title="Er is nu niets live"
                        description="Zodra een wedstrijd begint, verschijnt de actuele score en wedstrijdstatus automatisch in dit overzicht."
                    />
                </div>
            ) : (
                <div className="mt-5 divide-y divide-[#262c29] border-y border-[#262c29]">
                    {matches.map((match) => (
                        <Link
                            key={match.id}
                            href={showMatch(match.id)}
                            className="flex items-center justify-between gap-4 py-4 hover:bg-[#111513] focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:outline-none focus-visible:ring-inset"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#daddd9]">
                                    {match.home_team.name} —{' '}
                                    {match.away_team.name}
                                </p>
                                <span className="mt-1 block text-xs font-semibold text-[#6fae88]">
                                    {getLiveStatusLabel(
                                        match.status_long,
                                        match.status_short,
                                        match.elapsed_time,
                                    )}
                                </span>
                            </div>
                            <strong className="text-xl font-black text-white tabular-nums">
                                {match.home_goals ?? '—'}–
                                {match.away_goals ?? '—'}
                            </strong>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
