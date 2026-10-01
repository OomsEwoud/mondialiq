import MatchStatsPanel from '@/components/matches/details/match-stats-panel';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchStatsCard({ match }: Props) {
    return (
        <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">
                Team stats
            </h2>
            {match.stats.length > 0 ? (
                <MatchStatsPanel match={match} />
            ) : (
                <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                    No match statistics available yet.
                </p>
            )}
        </section>
    );
}
