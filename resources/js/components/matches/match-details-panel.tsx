import MatchDetailMeta from '@/components/matches/match-detail-meta';
import MatchDetailTeam from '@/components/matches/match-detail-team';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchDetailsPanel({ match }: Props) {
    return (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <MatchDetailTeam
                    label="Home team"
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                />

                <span className="text-center text-xs font-black text-slate-300">
                    VS
                </span>

                <MatchDetailTeam
                    label="Away team"
                    logo={match.awayTeamLogo}
                    name={match.awayTeam}
                    align="right"
                />
            </div>

            <MatchDetailMeta match={match} />
        </div>
    );
}
