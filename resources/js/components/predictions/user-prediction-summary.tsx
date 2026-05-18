import { BadgeCheck, Gauge, Goal } from 'lucide-react';
import { Badge } from '@/components/ui/feedback/badge';
import type { Match } from '@/types/match';
import { predictionScoreLabel } from '@/utils/match-prediction';

interface Props {
    match: Match;
}

export default function UserPredictionSummary({ match }: Props) {
    if (!match.userPrediction) {
        return null;
    }

    const score = predictionScoreLabel(match);

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge className="border-blue-200 bg-blue-50 text-blue-800">
                <BadgeCheck className="h-3 w-3" />
                Pick: {match.userPrediction.label}
            </Badge>

            {score && (
                <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                    <Goal className="h-3 w-3" />
                    Score: {score}
                </Badge>
            )}

            {match.userPrediction.confidence && (
                <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700 capitalize">
                    <Gauge className="h-3 w-3" />
                    {match.userPrediction.confidence} confidence
                </Badge>
            )}
        </div>
    );
}
