import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import AiPredictionHero from '@/components/predictions/ai-prediction-hero';
import DataSignals from '@/components/predictions/analysis/data-signals';
import PredictionExplanation from '@/components/predictions/analysis/prediction-explanation';
import PredictionHero from '@/components/predictions/analysis/prediction-hero';
import { cn } from '@/lib/utils';
import { show as showMatch } from '@/routes/matches';
import type { Match } from '@/types/match';
import type { AiPredictionContext } from '@/types/prediction';
import { cleanAiAdvice } from '@/utils/ai-prediction';
import { aiPredictionScoreLabel } from '@/utils/match-prediction';
import {
    outcomeEstimates,
    predictionOutlook,
    predictionSignals,
} from '@/utils/prediction-analysis';

interface Props {
    match: Match;
    aiContext: AiPredictionContext;
}

export default function AiPredictionReport({ match, aiContext }: Props) {
    const signals = predictionSignals(match, aiContext);

    return (
        <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
            <AiPredictionHero match={match} />
            <PredictionHero
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                score={aiPredictionScoreLabel(match)}
                outlook={predictionOutlook(match)}
                estimates={outcomeEstimates(match)}
            />
            <div
                className={cn(
                    'grid gap-8 px-1 sm:gap-10',
                    signals.length > 0 &&
                        'lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]',
                )}
            >
                <PredictionExplanation
                    advice={cleanAiAdvice(match.aiPrediction?.advice)}
                />
                <DataSignals signals={signals} />
            </div>
            <footer className="flex flex-col items-start justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-center">
                <p className="max-w-xl text-xs leading-5 text-muted-foreground">
                    AI-analyse op basis van beschikbare voetbalgegevens. Een
                    inschatting van de wedstrijd, geen garantie op de uitslag.
                </p>
                <Link
                    href={showMatch(match.id)}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm text-sm font-medium text-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    Bekijk wedstrijdgegevens{' '}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
            </footer>
        </div>
    );
}
