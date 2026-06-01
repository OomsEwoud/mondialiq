import { Eye, LockKeyhole, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import type { Match } from '@/types/match';
import { canMakePrediction } from '@/utils/match-prediction';

interface Props {
    match: Match;
    onClick: () => void;
}

export default function UserPredictionButton({ match, onClick }: Props) {
    const hasUserPrediction = Boolean(match.userPrediction);
    const predictionAllowed = canMakePrediction(match);
    const actionLabel = predictionAllowed
        ? hasUserPrediction
            ? 'Edit prediction'
            : 'Make prediction'
        : hasUserPrediction
          ? 'View prediction'
          : 'Predictions closed';
    const Icon = predictionAllowed
        ? PencilLine
        : hasUserPrediction
          ? Eye
          : LockKeyhole;

    if (!predictionAllowed && !hasUserPrediction) {
        return (
            <Button
                type="button"
                disabled
                aria-label="Predictions closed because match already started"
                className="cursor-not-allowed justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-800 opacity-100 shadow-none"
            >
                <Icon className="h-4 w-4" />
                {actionLabel}
            </Button>
        );
    }

    return (
        <Button
            type="button"
            onClick={onClick}
            variant={predictionAllowed ? 'default' : 'outline'}
            className={
                predictionAllowed
                    ? 'justify-center rounded-xl bg-blue-950 text-white shadow-sm hover:bg-blue-900 focus-visible:ring-cyan-300'
                    : 'justify-center rounded-xl border-amber-200 bg-amber-50 text-amber-800 shadow-none hover:bg-amber-100 hover:text-amber-900 focus-visible:ring-cyan-300'
            }
        >
            <Icon className="h-4 w-4" />
            {actionLabel}
        </Button>
    );
}
