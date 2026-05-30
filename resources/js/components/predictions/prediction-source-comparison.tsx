import ApiSourceCard from '@/components/predictions/api-source-card';
import MarketSourceCard from '@/components/predictions/market-source-card';
import type { AiPredictionContext } from '@/types/prediction';
import { hasMarketOdds } from '@/utils/ai-prediction';

interface Props {
    aiContext: AiPredictionContext;
}

export default function PredictionSourceComparison({ aiContext }: Props) {
    const hasMarket = hasMarketOdds(aiContext.marketOdds);
    const hasApi = aiContext.apiPrediction !== null;

    if (!hasMarket && !hasApi) {
        return null;
    }

    return (
        <section className="grid gap-4 lg:grid-cols-2">
            {hasMarket && (
                <MarketSourceCard marketOdds={aiContext.marketOdds} />
            )}
            {aiContext.apiPrediction && (
                <ApiSourceCard apiPrediction={aiContext.apiPrediction} />
            )}
        </section>
    );
}
