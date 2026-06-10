import { Zap } from 'lucide-react';
import PredictionPointsBadge from '@/components/predictions/prediction-points-badge';
import { Badge } from '@/components/ui/feedback/badge';
import type { Match } from '@/types/match';
import {
    getActualScoreLabel,
    isExactScoreCorrect,
    isFinishedFixture,
    isOutcomeCorrect,
} from '@/utils/ai-prediction';
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
    const actualScore = aiMode ? getActualScoreLabel(match) : null;
    const finishedFixture = aiMode ? isFinishedFixture(match) : false;
    const outcomeCorrect =
        aiMode && finishedFixture ? isOutcomeCorrect(match) : null;
    const exactScoreCorrect =
        aiMode && finishedFixture ? isExactScoreCorrect(match) : null;

    if (!prediction) {
        return null;
    }

    const score = aiMode
        ? aiPredictionScoreLabel(match)
        : predictionScoreLabel(match);

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
            {!score && (
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
            )}

            {aiMode && finishedFixture && actualScore && (
                <>
                    <Badge className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700">
                        Actual: {actualScore}
                    </Badge>
                    {outcomeCorrect === true && (
                        <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                            Outcome correct
                        </Badge>
                    )}
                    {prediction.homeScore !== null &&
                        prediction.awayScore !== null &&
                        exactScoreCorrect === true && (
                            <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                                Exact score correct
                            </Badge>
                        )}
                </>
            )}

            {prediction.isBoosted && (
                <Badge className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-700">
                    <Zap className="mr-1 size-3.5" />
                    Boosted
                </Badge>
            )}
            <PredictionPointsBadge
                points={prediction.points ?? null}
                pointsAwarded={prediction.pointsAwarded}
            />
        </div>
    );
}
