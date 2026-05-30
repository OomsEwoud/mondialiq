import { Gauge, Goal, Trophy } from 'lucide-react';
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

    return (
        <section className="grid gap-3 md:grid-cols-3">
            <PredictionSummaryCard
                icon={Trophy}
                label="Predicted outcome"
                value={formatPredictedOutcome(prediction?.label)}
            />
            <PredictionSummaryCard
                icon={Gauge}
                label="Confidence"
                value={confidence.value}
                helper={confidence.helper}
            />
            <PredictionSummaryCard
                icon={Goal}
                label="Predicted score"
                value={score ?? 'No score predicted'}
            />
        </section>
    );
}
