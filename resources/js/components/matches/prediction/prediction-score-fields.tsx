import PredictionScoreInput from '@/components/matches/prediction/prediction-score-input';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    homeScore: string;
    awayScore: string;
    disabled: boolean;
    homeError?: string;
    awayError?: string;
    onHomeScoreChange: (score: string) => void;
    onAwayScoreChange: (score: string) => void;
}

export default function PredictionScoreFields({
    match,
    homeScore,
    awayScore,
    disabled,
    homeError,
    awayError,
    onHomeScoreChange,
    onAwayScoreChange,
}: Props) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PredictionScoreInput
                id={`home-score-${match.id}`}
                label={`Predicted ${match.homeTeam} score`}
                value={homeScore}
                disabled={disabled}
                error={homeError}
                onChange={onHomeScoreChange}
            />
            <PredictionScoreInput
                id={`away-score-${match.id}`}
                label={`Predicted ${match.awayTeam} score`}
                value={awayScore}
                disabled={disabled}
                error={awayError}
                onChange={onAwayScoreChange}
            />
        </div>
    );
}
