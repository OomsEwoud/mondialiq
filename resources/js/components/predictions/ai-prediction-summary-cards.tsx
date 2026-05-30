import { Gauge, Goal, Trophy } from 'lucide-react';
import PredictionSummaryCard from '@/components/predictions/prediction-summary-card';
import type { Match } from '@/types/match';
import { formatAiConfidence } from '@/utils/ai-prediction';

interface Props {
    match: Match;
    score: string | null;
}

export default function AiPredictionSummaryCards({ match, score }: Props) {
    const prediction = match.aiPrediction;
    const confidence = formatAiConfidence(prediction?.confidence);

    return (
        <section className="grid gap-3 md:grid-cols-3">
            <PredictionSummaryCard
                icon={Trophy}
                label="Predicted outcome"
                value={prediction?.label ?? 'Outcome not available'}
            />
            <PredictionSummaryCard
                icon={Gauge}
                label="Confidence"
                value={confidence.value}
                helper={confidence.label}
            />
            <PredictionSummaryCard
                icon={Goal}
                label="Expected score"
                value={score ?? 'Score prediction not available'}
            />
        </section>
    );
}
