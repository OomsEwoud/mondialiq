import MatchStatRow from '@/components/matches/details/match-stat-row';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchStatsCard({ match }: Props) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black text-blue-950">
                Team stats
            </h2>
            {match.stats.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {match.stats.map((stat) => (
                        <MatchStatRow
                            key={stat.name}
                            stat={stat}
                            homeCode={match.homeTeam.code}
                            awayCode={match.awayTeam.code}
                        />
                    ))}
                </div>
            ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No team stats available yet.
                </p>
            )}
        </section>
    );
}
