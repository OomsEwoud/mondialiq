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
                        ? 'rounded-full border-cyan-200 bg-cyan-50 px-3 py-1 font-medium text-cyan-700'
                        : 'rounded-full border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-800'
                }
            >
                {aiMode ? 'Predicted outcome' : 'Prediction'}:{' '}
                {prediction.label}
            </Badge>

            {score && (
                <Badge className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700">
                    Score: {score}
                </Badge>
            )}

            {prediction.confidence && (
                <Badge className="rounded-full border-cyan-200 bg-cyan-50 px-3 py-1 font-medium text-cyan-700 capitalize">
                    {prediction.confidence} confidence
                </Badge>
            )}

            {!aiMode && (
                <PredictionPointsBadge points={prediction.points ?? null} />
            )}
        </div>
    );
}
