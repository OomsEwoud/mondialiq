import MatchStatsPanel from '@/components/matches/details/match-stats-panel';
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
                <MatchStatsPanel match={match} />
            ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No match statistics available yet.
                </p>
            )}
        </section>
    );
}
