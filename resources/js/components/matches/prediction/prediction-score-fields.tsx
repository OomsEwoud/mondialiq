import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
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
                label={`Predicted ${match.homeTeamShort} score`}
                value={homeScore}
                disabled={disabled}
                error={homeError}
                onChange={onHomeScoreChange}
            />
            <PredictionScoreInput
                id={`away-score-${match.id}`}
                label={`Predicted ${match.awayTeamShort} score`}
                value={awayScore}
                disabled={disabled}
                error={awayError}
                onChange={onAwayScoreChange}
            />
        </div>
    );
}

interface PredictionScoreInputProps {
    id: string;
    label: string;
    value: string;
    disabled: boolean;
    error?: string;
    onChange: (score: string) => void;
}

function PredictionScoreInput({
    id,
    label,
    value,
    disabled,
    error,
    onChange,
}: PredictionScoreInputProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type="number"
                min="0"
                max="99"
                inputMode="numeric"
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
