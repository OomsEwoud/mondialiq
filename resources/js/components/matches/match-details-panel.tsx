import MatchDetailMeta from '@/components/matches/match-detail-meta';
import MatchDetailTeam from '@/components/matches/match-detail-team';
import MatchDetailsActionButton from '@/components/matches/prediction/match-details-action-button';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchDetailsPanel({ match }: Props) {
    return (
        <div className="mt-5 border-t border-[#29312c] pt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#70b98e] uppercase">
                    Over deze wedstrijd
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-8">
                <MatchDetailTeam
                    id={match.homeTeamId}
                    label="Thuisploeg"
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                />

                <span className="rounded-sm border border-[#343d37] bg-[#0b0e0d] px-4 py-1.5 text-center text-xs font-semibold text-[#68716b]">
                    VS
                </span>

                <MatchDetailTeam
                    id={match.awayTeamId}
                    label="Uitploeg"
                    logo={match.awayTeamLogo}
                    name={match.awayTeam}
                    align="right"
                />
            </div>

            <MatchDetailMeta match={match} />
            <div className="mt-4 flex justify-end border-t border-border pt-4">
                <MatchDetailsActionButton matchId={match.id} />
            </div>
        </div>
    );
}
