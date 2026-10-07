import { Link } from '@inertiajs/react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { show } from '@/routes/matches';
import type { PredictionType, RecentPrediction } from '@/types/ai-ranking';
import { predictionOutcomeLabel, rankingPercentage } from '@/utils/ai-ranking';

export default function RecentPredictionPerformance({
    predictions,
    predictionType,
}: {
    predictions: RecentPrediction[];
    predictionType: PredictionType;
}) {
    return (
        <section
            aria-labelledby="recent-performance-heading"
            className="mt-12 min-w-0"
        >
            <h2
                id="recent-performance-heading"
                className="text-xl font-bold tracking-tight text-foreground"
            >
                Recente voorspellingen
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
                De laatste 12 beoordeelde voorspellingen in deze selectie,
                tegenover de uitslag.
            </p>
            {predictions.length === 0 ? (
                <p className="mt-6 border-y border-border-subtle py-8 text-sm text-muted-foreground">
                    Zodra wedstrijden zijn afgerond, verschijnen hier de
                    voorspelling en het resultaat.
                </p>
            ) : (
                <div
                    className="mt-6 overflow-x-auto border-y border-border-subtle focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    tabIndex={0}
                    role="region"
                    aria-label="Voorspelling tegenover wedstrijduitslag"
                >
                    <table className="w-full min-w-[700px] text-left text-sm">
                        <caption className="sr-only">
                            Recente AI-voorspellingen en hun resultaat
                        </caption>
                        <thead className="text-xs text-muted-foreground">
                            <tr>
                                {[
                                    'Wedstrijd',
                                    'Voorspelling',
                                    'Werkelijke uitslag',
                                    'Confidence',
                                    'Beoordeling',
                                ].map((label) => (
                                    <th
                                        key={label}
                                        scope="col"
                                        className="px-3 py-4 font-semibold"
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {predictions.map((prediction) => (
                                <tr
                                    key={prediction.id}
                                    className="border-t border-border-subtle"
                                >
                                    <th
                                        scope="row"
                                        className="px-3 py-5 font-normal"
                                    >
                                        <Link
                                            href={show.url(
                                                prediction.fixtureId,
                                            )}
                                            className="inline-flex min-h-11 items-center font-semibold text-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        >
                                            {prediction.homeTeam} –{' '}
                                            {prediction.awayTeam}
                                        </Link>
                                        <span className="block text-xs text-muted-foreground">
                                            {prediction.competition} ·{' '}
                                            <time
                                                dateTime={prediction.kickoffAt}
                                            >
                                                {new Intl.DateTimeFormat(
                                                    'nl-BE',
                                                    {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        timeZone:
                                                            'Europe/Brussels',
                                                    },
                                                ).format(
                                                    new Date(
                                                        prediction.kickoffAt,
                                                    ),
                                                )}
                                            </time>
                                        </span>
                                    </th>
                                    <td className="px-3 py-5 text-foreground">
                                        {predictionType === 'exact'
                                            ? prediction.predictedScore
                                            : predictionOutcomeLabel(
                                                  prediction.outcome,
                                                  prediction.homeTeam,
                                                  prediction.awayTeam,
                                              )}
                                        {predictionType !== 'exact' &&
                                            prediction.predictedScore !==
                                                null && (
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    Score:{' '}
                                                    {prediction.predictedScore}
                                                </span>
                                            )}
                                    </td>
                                    <td className="px-3 py-5 font-semibold text-foreground tabular-nums">
                                        {prediction.actualScore}
                                    </td>
                                    <td className="px-3 py-5 text-muted-foreground tabular-nums">
                                        {rankingPercentage(
                                            prediction.confidence,
                                        )}
                                    </td>
                                    <td className="px-3 py-5">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-2 text-xs font-semibold',
                                                prediction.correct
                                                    ? 'text-positive'
                                                    : 'text-[#b3bbb5]',
                                            )}
                                        >
                                            {prediction.correct ? (
                                                <Check
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                            ) : (
                                                <Minus
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                            )}
                                            {prediction.correct
                                                ? 'Correct'
                                                : 'Incorrect'}
                                        </span>
                                        {predictionType !== 'exact' &&
                                            prediction.exactCorrect !==
                                                null && (
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    Score{' '}
                                                    {prediction.exactCorrect
                                                        ? 'exact juist'
                                                        : 'niet exact'}
                                                </span>
                                            )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
