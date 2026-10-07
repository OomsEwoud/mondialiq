import { cn } from '@/lib/utils';
import type { PerformanceMetrics, PredictionType } from '@/types/ai-ranking';
import { rankingPercentage } from '@/utils/ai-ranking';

export default function AiPerformanceSummary({
    metrics,
    predictionType,
}: {
    metrics: PerformanceMetrics;
    predictionType: PredictionType;
}) {
    const cards = [
        {
            label:
                predictionType === 'exact'
                    ? 'Nauwkeurigheid · exacte score'
                    : 'Nauwkeurigheid · uitkomst',
            value: rankingPercentage(metrics.accuracy),
            detail: `${metrics.correctCount} van ${metrics.evaluatedCount} juist`,
            accent: true,
        },
        {
            label: 'Correcte wedstrijduitkomst',
            value: rankingPercentage(metrics.outcomeAccuracy),
            detail: `${metrics.outcomeCorrectCount} / ${metrics.outcomeEvaluatedCount} uitkomsten`,
            accent: false,
        },
        {
            label: 'Exacte score',
            value: rankingPercentage(metrics.exactAccuracy),
            detail: `${metrics.exactCount} / ${metrics.exactEligibleCount} scorevoorspellingen`,
            accent: false,
        },
        {
            label: 'Voorspellingen geanalyseerd',
            value: new Intl.NumberFormat('nl-BE').format(
                metrics.evaluatedCount,
            ),
            detail: `${metrics.predictionCount} opgeslagen in deze selectie`,
            accent: false,
        },
    ];

    return (
        <section aria-label="Kerncijfers van MondialiQ AI" className="mb-10">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-b border-border-subtle pb-7 lg:grid-cols-4 lg:gap-x-8">
                {cards.map((card) => (
                    <div key={card.label} className="min-w-0">
                        <dt className="text-xs font-semibold text-muted-foreground">
                            {card.label}
                        </dt>
                        <dd
                            className={cn(
                                'mt-3 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl',
                                card.accent
                                    ? 'text-positive'
                                    : 'text-foreground',
                            )}
                        >
                            {card.value}
                        </dd>
                        <dd className="mt-2 text-xs leading-5 text-muted-foreground">
                            {card.detail}
                        </dd>
                    </div>
                ))}
            </dl>
            {metrics.evaluatedCount === 0 && (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Nog geen beoordeelbare resultaten in deze selectie. Kies een
                    ruimere periode of wis de filters.
                </p>
            )}
        </section>
    );
}
