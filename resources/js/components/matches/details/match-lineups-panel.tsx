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
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                No lineups available yet for this match.
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
