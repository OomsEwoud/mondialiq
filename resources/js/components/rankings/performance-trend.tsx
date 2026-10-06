import type { AiPerformancePageProps } from '@/types/ai-ranking';
import { rankingChange, rankingPercentage } from '@/utils/ai-ranking';

export default function PerformanceTrend({
    periods,
    daily,
}: {
    periods: AiPerformancePageProps['periodPerformance'];
    daily: AiPerformancePageProps['dailyPerformance'];
}) {
    const hasResults = daily.some((day) => day.evaluatedCount > 0);

    return (
        <section aria-labelledby="performance-trend-heading" className="mb-12">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                <h2
                    id="performance-trend-heading"
                    className="text-xl font-bold tracking-tight text-white"
                >
                    Prestaties door de tijd
                </h2>
                <p className="text-xs text-[#89928c]">
                    7 en 30 dagen · tegenover de voorgaande periode
                </p>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                <dl className="grid grid-cols-2 gap-5">
                    {periods.map((period) => (
                        <div
                            key={period.days}
                            className="border-t border-[#262c29] pt-5"
                        >
                            <dt className="text-sm font-semibold text-[#949d97]">
                                Laatste {period.days} dagen
                            </dt>
                            <dd className="mt-2 text-3xl font-bold text-white tabular-nums">
                                {rankingPercentage(period.current.accuracy)}
                            </dd>
                            <dd className="mt-2 text-xs leading-5 text-[#89928c]">
                                {period.current.correctCount} /{' '}
                                {period.current.evaluatedCount} juist
                            </dd>
                            <dd className="mt-3 text-sm font-semibold text-[#c5ccc7] tabular-nums">
                                {rankingChange(period.change)}{' '}
                                <span className="font-normal text-[#89928c]">
                                    vs. {period.days} dagen daarvoor
                                </span>
                            </dd>
                            <dd className="mt-1 text-xs text-[#89928c]">
                                Vorige periode:{' '}
                                {rankingPercentage(period.previous.accuracy)} ·{' '}
                                {period.previous.evaluatedCount} beoordeeld
                            </dd>
                        </div>
                    ))}
                </dl>
                <div className="min-w-0 border-t border-[#262c29] pt-5">
                    <h3 className="text-sm font-semibold text-[#949d97]">
                        Dagelijkse nauwkeurigheid
                    </h3>
                    {hasResults ? (
                        <>
                            <ol
                                aria-label="Nauwkeurigheid per dag, laatste 30 kalenderdagen"
                                className="mt-4 flex h-28 items-end gap-1"
                            >
                                {daily.map((day) => (
                                    <li
                                        key={day.date}
                                        title={`${day.date}: ${rankingPercentage(day.accuracy)} · ${day.correctCount}/${day.evaluatedCount} juist`}
                                        aria-label={`${day.date}: ${day.accuracy === null ? 'geen beoordeelde voorspellingen' : `${rankingPercentage(day.accuracy)}, ${day.correctCount} van ${day.evaluatedCount} juist`}`}
                                        className="flex h-full min-w-0 flex-1 items-end"
                                    >
                                        <div
                                            aria-hidden="true"
                                            className={
                                                day.accuracy === null
                                                    ? 'w-full border-b border-dashed border-[#343d37]'
                                                    : 'w-full rounded-t-sm bg-[#6fae88]'
                                            }
                                            style={
                                                day.accuracy === null
                                                    ? undefined
                                                    : {
                                                          height: `${Math.max(day.accuracy, 1)}%`,
                                                      }
                                            }
                                        />
                                    </li>
                                ))}
                            </ol>
                            <div className="mt-3 flex justify-between text-xs text-[#89928c]">
                                <time dateTime={daily[0]?.date}>
                                    {daily[0]?.date}
                                </time>
                                <span>Vandaag</span>
                            </div>
                        </>
                    ) : (
                        <p className="mt-5 text-sm leading-6 text-[#949d97]">
                            Geen beoordeelde voorspellingen in de laatste 30
                            kalenderdagen.
                        </p>
                    )}
                </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#89928c]">
                Deze vaste vensters gebruiken je competitie-, team-, type- en
                confidencefilters. De periodefilter bepaalt de overige secties.
                Dagen zonder resultaten tellen niet als 0%.
            </p>
        </section>
    );
}
