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
                className="border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(253,230,138,0.7))] text-amber-900 shadow-none"
            >
                <LockKeyhole className="h-3 w-3" />
                Predictions closed
            </Badge>
        );
    }

    return (
        <Badge className="border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.85))] text-cyan-800 shadow-none">
            <PencilLine className="h-3 w-3" />
            Predictions open
        </Badge>
    );
}
