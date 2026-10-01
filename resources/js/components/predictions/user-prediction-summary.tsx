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
                            ? 'rounded-full border-border bg-accent px-3 py-1 font-medium text-primary'
                            : 'rounded-full border-border bg-muted px-3 py-1 font-medium text-foreground'
                    }
                >
                    {aiMode ? 'Predicted outcome' : 'Prediction'}:{' '}
                    {prediction.label}
                </Badge>
            )}

            {aiMode && finishedFixture && actualScore && (
                <>
                    <Badge className="rounded-full border-border bg-muted px-3 py-1 font-medium text-foreground">
                        Actual: {actualScore}
                    </Badge>
                    {outcomeCorrect === true && (
                        <Badge className="rounded-full border-emerald-200 bg-emerald-950/40 px-3 py-1 font-medium text-emerald-200">
                            Outcome correct
                        </Badge>
                    )}
                    {prediction.homeScore !== null &&
                        prediction.awayScore !== null &&
                        exactScoreCorrect === true && (
                            <Badge className="rounded-full border-emerald-200 bg-emerald-950/40 px-3 py-1 font-medium text-emerald-200">
                                Exact score correct
                            </Badge>
                        )}
                </>
            )}

            {prediction.isBoosted && (
                <Badge className="rounded-full border-amber-200 bg-amber-950/40 px-3 py-1 font-medium text-amber-200">
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
