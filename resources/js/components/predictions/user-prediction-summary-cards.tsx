import { Gauge, Goal, Medal, Trophy } from 'lucide-react';
import PredictionSummaryCard from '@/components/predictions/prediction-summary-card';
import type { Match } from '@/types/match';
import {
    formatPredictedOutcome,
    formatUserPredictionConfidence,
} from '@/utils/user-prediction';

interface Props {
    match: Match;
    score: string | null;
}

export default function UserPredictionSummaryCards({ match, score }: Props) {
    const prediction = match.userPrediction;
    const confidence = formatUserPredictionConfidence(
        prediction?.confidence ?? null,
    );
    const hasFinalScore =
        match.score.fulltime.home !== null &&
        match.score.fulltime.away !== null;
    const pointsValue = hasFinalScore
        ? `${prediction?.points ?? 0}/20`
        : '20 max';

    return (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <PredictionSummaryCard
                icon={Trophy}
                label="Predicted outcome"
                value={formatPredictedOutcome(prediction?.label)}
            />
            <PredictionSummaryCard
                icon={Gauge}
                label="Confidence"
                value={confidence.value}
                helper="Saved for context, not used for points"
            />
            <PredictionSummaryCard
                icon={Goal}
                label="Predicted score"
                value={score ?? 'No score predicted'}
            />
            <PredictionSummaryCard
                icon={Medal}
                label={hasFinalScore ? 'Points earned' : 'Possible points'}
                value={pointsValue}
                helper={
                    hasFinalScore
                        ? 'Based on the final score'
                        : 'Calculated after full time'
                }
            />
        </section>
    );
}
