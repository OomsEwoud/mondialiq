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
                className="gap-1 border-amber-200 bg-amber-950/40 text-amber-200 shadow-none"
            >
                <LockKeyhole className="h-3 w-3" />
                Predictions closed
            </Badge>
        );
    }

    return (
        <Badge className="gap-1 border-border bg-accent text-primary shadow-none">
            <PencilLine className="h-3 w-3" />
            Predictions open
        </Badge>
    );
}
