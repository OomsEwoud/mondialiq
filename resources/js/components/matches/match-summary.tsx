import MatchScoreDisplay from '@/components/matches/match-score-display';
import MatchTeam from '@/components/matches/match-team';
import type { Match } from '@/types/match';
import { getWinner } from '@/utils/match-status';

interface Props {
    match: Match;
}

export default function MatchSummary({ match }: Props) {
    const winner = getWinner(match);

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
            <MatchTeam
                id={match.homeTeamId}
                logo={match.homeTeamLogo}
                name={match.homeTeam}
                code={match.homeTeamShort}
                isWinner={winner === 'home'}
            />

            <MatchScoreDisplay match={match} />

            <MatchTeam
                id={match.awayTeamId}
                logo={match.awayTeamLogo}
                name={match.awayTeam}
                code={match.awayTeamShort}
                isWinner={winner === 'away'}
                align="right"
            />
        </div>
    );
}
