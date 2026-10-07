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
            ? 'Bewerk voorspelling'
            : 'Maak voorspelling'
        : hasUserPrediction
          ? 'Bekijk voorspelling'
          : 'Voorspellen gesloten';
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
                aria-label="Voorspellen is gesloten omdat de wedstrijd al begonnen is"
                className="cursor-not-allowed justify-center rounded-md border border-[#403c2c] bg-[#1d1b13] text-[#b9aa72] opacity-100 shadow-none"
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
                    ? 'justify-center rounded-md bg-crest-surface text-background shadow-none hover:bg-primary focus-visible:ring-ring'
                    : 'justify-center rounded-md border-[#5a5132] bg-[#1d1b13] text-[#c9b977] shadow-none hover:bg-[#282419] hover:text-[#e0d295] focus-visible:ring-ring'
            }
        >
            <Icon className="h-4 w-4" />
            {actionLabel}
        </Button>
    );
}
