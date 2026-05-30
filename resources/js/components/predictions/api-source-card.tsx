import PredictionSourceCard from '@/components/predictions/prediction-source-card';
import type { ApiPredictionSummary } from '@/types/prediction';
import { formatProbability } from '@/utils/ai-prediction';

interface Props {
    apiPrediction: ApiPredictionSummary;
}

export default function ApiSourceCard({ apiPrediction }: Props) {
    return (
        <PredictionSourceCard
            title="API view"
            subtitle="API-Football prediction signal"
            rows={[
                [
                    'Advice',
                    apiPrediction.api_predicted_outcome ??
                        apiPrediction.api_advice ??
                        'Not available',
                ],
                [
                    'Home chance',
                    formatProbability(apiPrediction.api_home_chance),
                ],
                [
                    'Draw chance',
                    formatProbability(apiPrediction.api_draw_chance),
                ],
                [
                    'Away chance',
                    formatProbability(apiPrediction.api_away_chance),
                ],
                ['Goal trend', apiPrediction.api_goal_trend ?? 'Not available'],
            ]}
        />
    );
}
