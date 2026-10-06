import { router } from '@inertiajs/react';
import { useState } from 'react';
import AiPerformanceSummary from '@/components/rankings/ai-ranking-summary';
import AiPerformanceFilters from '@/components/rankings/ai-rankings-filters';
import RecentPredictionPerformance from '@/components/rankings/ai-rankings-table';
import CompetitionPerformance from '@/components/rankings/competition-performance';
import PerformanceBreakdowns from '@/components/rankings/performance-breakdowns';
import PerformanceTrend from '@/components/rankings/performance-trend';
import PageHead from '@/components/seo/page-head';
import { leaderboards } from '@/routes';
import type {
    AiPerformancePageProps,
    PerformanceFilters,
} from '@/types/ai-ranking';

export default function AiPerformance({
    summary,
    periodPerformance,
    dailyPerformance,
    competitionPerformance,
    teamPerformance,
    typePerformance,
    confidencePerformance,
    recentPredictions,
    competitionOptions,
    teamOptions,
    filters,
}: AiPerformancePageProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const updateFilters = (nextFilters: PerformanceFilters) => {
        router.get(
            leaderboards.url(),
            {
                ...(nextFilters.competition === null
                    ? {}
                    : { competition: nextFilters.competition }),
                ...(nextFilters.team === null
                    ? {}
                    : { team: nextFilters.team }),
                period: nextFilters.period,
                predictionType: nextFilters.predictionType,
                confidence: nextFilters.confidence,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onStart: () => {
                    setLoading(true);
                    setError(null);
                },
                onError: () =>
                    setError(
                        'Deze filterselectie kon niet worden toegepast. Wis de filters of kies opnieuw.',
                    ),
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <>
            <PageHead
                title="AI Prestaties"
                description="Bekijk de nauwkeurigheid, trends en resultaten van de MondialiQ AI prediction-engine."
            />
            <header className="mb-8 max-w-3xl">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                    MondialiQ AI · Performance
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                    AI Prestaties
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#949d97]">
                    Eén prediction-engine, gevoed door voetbaldata, machine
                    learning en voorspellingslogica. Volg de nauwkeurigheid en
                    ontdek hoe de prestaties zich ontwikkelen.
                </p>
            </header>
            <AiPerformanceFilters
                filters={filters}
                competitionOptions={competitionOptions}
                teamOptions={teamOptions}
                onChange={updateFilters}
                loading={loading}
            />
            {error && (
                <p role="alert" className="mb-5 text-sm text-destructive">
                    {error}
                </p>
            )}
            <div
                aria-busy={loading}
                className={
                    loading
                        ? 'opacity-60 transition-opacity motion-reduce:transition-none'
                        : 'transition-opacity motion-reduce:transition-none'
                }
            >
                <AiPerformanceSummary
                    metrics={summary}
                    predictionType={filters.predictionType}
                />
                <PerformanceTrend
                    periods={periodPerformance}
                    daily={dailyPerformance}
                />
                <div className="grid items-start gap-10 lg:grid-cols-2">
                    <CompetitionPerformance
                        competitions={competitionPerformance}
                    />
                    <PerformanceBreakdowns
                        teams={teamPerformance}
                        types={typePerformance}
                        confidence={confidencePerformance}
                    />
                </div>
                <RecentPredictionPerformance
                    predictions={recentPredictions}
                    predictionType={filters.predictionType}
                />
            </div>
            <details className="mt-8 border-t border-[#262c29] pt-5 text-xs leading-6 text-[#89928c]">
                <summary className="w-fit cursor-pointer rounded-sm font-semibold text-[#c5ccc7] focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none">
                    Hoe meten we de prestaties?
                </summary>
                <div className="mt-3 max-w-3xl space-y-2">
                    <p>
                        We beoordelen alleen publieke voorspellingen van
                        MondialiQ AI die vóór de aftrap zijn aangemaakt, voor
                        afgeronde wedstrijden met een bekende uitslag na
                        reguliere speeltijd. De eerste nauwkeurigheidswaarde
                        volgt het gekozen voorspellingstype; standaard meten we
                        de voorspelde uitkomst. Exacte scores hebben hun eigen
                        steekproef.
                    </p>
                    <p>
                        Wedstrijduitkomsten omvatten 1X2 en dubbele kansen. Je
                        kunt beide apart bekijken. Bij een exacte-scoreselectie
                        betekent correct dat beide doelpuntenaantallen juist
                        zijn. Confidence is een inschatting vooraf en is niet
                        hetzelfde als gemeten nauwkeurigheid.
                    </p>
                    <p>
                        Trends tonen procentpunten verschil. Ontbrekende
                        resultaten worden weergegeven met een streepje, nooit
                        als een verzonnen percentage. Dit overzicht gebruikt de
                        huidige opgeslagen voorspellingen; historische
                        wijzigingen zijn niet afzonderlijk vastgelegd.
                    </p>
                </div>
            </details>
        </>
    );
}
