import { LockKeyhole, PencilLine } from 'lucide-react';
import { Badge } from '@/components/ui/feedback/badge';
import type { Match } from '@/types/match';
import { canMakePrediction } from '@/utils/match-prediction';

interface Props {
    match: Match;
}

export default function PredictionAvailabilityBadge({ match }: Props) {
    if (!canMakePrediction(match)) {
        return (
            <Badge
                aria-label="Predictions closed because match already started"
                className="gap-1 border-amber-200 bg-amber-50 text-amber-700 shadow-none"
            >
                <LockKeyhole className="h-3 w-3" />
                Predictions closed
            </Badge>
        );
    }

    return (
        <Badge className="gap-1 border-cyan-200 bg-cyan-50 text-cyan-700 shadow-none">
            <PencilLine className="h-3 w-3" />
            Predictions open
        </Badge>
    );
}
