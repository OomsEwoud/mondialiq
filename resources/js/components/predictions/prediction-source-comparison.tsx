import ApiSourceCard from '@/components/predictions/api-source-card';
import MarketSourceCard from '@/components/predictions/market-source-card';
import type { AiPredictionContext } from '@/types/prediction';
import { hasMarketOdds } from '@/utils/ai-prediction';

interface Props {
    aiContext: AiPredictionContext;
}

export default function PredictionSourceComparison({ aiContext }: Props) {
    const { apiPrediction, marketOdds } = aiContext;
    const hasMarket = hasMarketOdds(marketOdds);
    const hasApi = apiPrediction !== null;
    const signalsDiffer =
        hasMarket && hasApi
            ? marketSignal(marketOdds) !== apiSignal(apiPrediction)
            : false;

    if (!hasMarket && !hasApi) {
        return null;
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-blue-950">
                        Data signals
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                        Market and API views are separate inputs for the model.
                    </p>
                </div>
                {signalsDiffer ? (
                    <span className="w-fit rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black tracking-[0.12em] text-cyan-700 uppercase">
                        Signals differ
                    </span>
                ) : null}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {hasMarket && <MarketSourceCard marketOdds={marketOdds} />}
                {apiPrediction && (
                    <ApiSourceCard apiPrediction={apiPrediction} />
                )}
            </div>
        </section>
    );
}

function marketSignal(
    marketOdds: AiPredictionContext['marketOdds'],
): 'home' | 'draw' | 'away' | null {
    const values = [
        ['home', marketOdds.home_win_probability],
        ['draw', marketOdds.draw_probability],
        ['away', marketOdds.away_win_probability],
    ] as const;
    const available = values.filter(([, value]) => value !== null);

    if (available.length === 0) {
        return null;
    }

    return available.reduce((highest, current) =>
        (current[1] ?? 0) > (highest[1] ?? 0) ? current : highest,
    )[0];
}

function apiSignal(
    apiPrediction: NonNullable<AiPredictionContext['apiPrediction']>,
): 'home' | 'draw' | 'away' | null {
    const outcome = apiPrediction.api_predicted_outcome?.toLowerCase() ?? '';

    if (outcome.includes('draw')) {
        return 'draw';
    }

    if (outcome.includes('home')) {
        return 'home';
    }

    if (outcome.includes('away')) {
        return 'away';
    }

    return null;
}
