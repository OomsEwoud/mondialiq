import { BadgeCheck, Gauge, Goal } from 'lucide-react';
import PredictionPointsBadge from '@/components/predictions/prediction-points-badge';
import { Badge } from '@/components/ui/feedback/badge';
import type { Match } from '@/types/match';
import {
    aiPredictionScoreLabel,
    predictionScoreLabel,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
    aiMode?: boolean;
}

export default function UserPredictionSummary({
    match,
    aiMode = false,
}: Props) {
    const prediction = aiMode ? match.aiPrediction : match.userPrediction;

    if (!prediction) {
        return null;
    }

    const score = aiMode
        ? aiPredictionScoreLabel(match)
        : predictionScoreLabel(match);

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge
                className={
                    aiMode
                        ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                        : 'border-slate-200 bg-slate-50 text-slate-800'
                }
            >
                <BadgeCheck className="h-3 w-3" />
                {aiMode ? 'Predicted outcome' : 'Prediction'}:{' '}
                {prediction.label}
            </Badge>

            {score && (
                <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                    <Goal className="h-3 w-3" />
                    Score: {score}
                </Badge>
            )}

            {prediction.confidence && (
                <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700 capitalize">
                    <Gauge className="h-3 w-3" />
                    {prediction.confidence} confidence
                </Badge>
            )}

            {!aiMode && (
                <PredictionPointsBadge points={prediction.points ?? null} />
            )}
        </div>
    );
}
