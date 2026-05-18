import PredictionOptionCard from '@/components/matches/prediction/prediction-option-card';
import { Label } from '@/components/ui/forms/label';
import type { Match } from '@/types/match';
import type { PredictionOutcome } from '@/types/match-prediction';

interface Props {
    match: Match;
    value: string;
    disabled: boolean;
    error?: string;
    onChange: (outcome: PredictionOutcome) => void;
}

export default function PredictionOutcomeField({
    match,
    value,
    disabled,
    error,
    onChange,
}: Props) {
    return (
        <div className="grid gap-2">
            <Label>Match outcome</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <PredictionOptionCard
                    label={match.homeTeamShort}
                    description={`${match.homeTeam} wins`}
                    selected={value === 'home'}
                    disabled={disabled}
                    onSelect={() => onChange('home')}
                />
                <PredictionOptionCard
                    label="Draw"
                    description="The match ends level"
                    selected={value === 'draw'}
                    disabled={disabled}
                    onSelect={() => onChange('draw')}
                />
                <PredictionOptionCard
                    label={match.awayTeamShort}
                    description={`${match.awayTeam} wins`}
                    selected={value === 'away'}
                    disabled={disabled}
                    onSelect={() => onChange('away')}
                />
            </div>
            {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
