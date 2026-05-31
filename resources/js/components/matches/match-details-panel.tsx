import MatchDetailMeta from '@/components/matches/match-detail-meta';
import MatchDetailTeam from '@/components/matches/match-detail-team';
import MatchPredictionActions from '@/components/matches/prediction/match-prediction-actions';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchDetailsPanel({ match }: Props) {
    return (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Match details
                    </p>
                    <h3 className="text-sm font-bold text-slate-900">
                        {match.homeTeamShort} vs {match.awayTeamShort}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <MatchDetailTeam
                    id={match.homeTeamId}
                    label="Home team"
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                />

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-center text-xs font-black text-slate-500">
                    VS
                </span>

                <MatchDetailTeam
                    id={match.awayTeamId}
                    label="Away team"
                    logo={match.awayTeamLogo}
                    name={match.awayTeam}
                    align="right"
                />
            </div>

            <MatchDetailMeta match={match} />
            <MatchPredictionActions match={match} />
        </div>
    );
}
