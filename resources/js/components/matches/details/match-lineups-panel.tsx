import { UsersRound } from 'lucide-react';
import MatchLineupTeamCard from '@/components/matches/details/match-lineup-team-card';
import type { MatchDetails } from '@/types/match-details';
import { hasLineupData } from '@/utils/match-lineup';

interface Props {
    match: MatchDetails;
}

export default function MatchLineupsPanel({ match }: Props) {
    const hasLineups =
        hasLineupData(match.lineups.home) || hasLineupData(match.lineups.away);

    if (!hasLineups) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm font-medium text-muted-foreground">
                <span className="flex size-10 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm ring-1 ring-border">
                    <UsersRound className="size-4" />
                </span>
                <p>No lineups available yet for this match.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MatchLineupTeamCard
                team={match.homeTeam}
                lineup={match.lineups.home}
            />
            <MatchLineupTeamCard
                team={match.awayTeam}
                lineup={match.lineups.away}
            />
        </div>
    );
}
