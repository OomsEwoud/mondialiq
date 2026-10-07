import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Pagination from '@/components/navigation/pagination';
import AnalysisFeed from '@/components/predictions/analysis-feed';
import EmptyFilteredPredictionsState from '@/components/predictions/empty-filtered-predictions-state';
import PredictionInfoGrid from '@/components/predictions/prediction-info-grid';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionPageHeader from '@/components/predictions/prediction-page-header';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import PredictionToolbar from '@/components/predictions/prediction-toolbar';
import PageHead from '@/components/seo/page-head';
import { predictions as predictionsRoute } from '@/routes';
import type { PredictionPageProps as Props } from '@/types/prediction';
import type {
    PredictionFilters,
    PredictionStatusFilter,
} from '@/types/prediction-filter';
import {
    defaultPredictionFilters,
    hasActivePredictionFilters,
    matchesFilters,
    sortByConfidence,
} from '@/utils/prediction-filters';

export default function Predictions({
    fixtures,
    filters: initialFilters,
    mode,
    scoringGuideHref,
}: Props) {
    const isPersonal = mode === 'mine';
    const [loading, setLoading] = useState(false);
    const defaultFilters = {
        ...defaultPredictionFilters,
        date: initialFilters.date,
        status: initialFilters.status,
        pointsState: initialFilters.pointsState,
    };
    const [filtersByMode, setFiltersByMode] = useState<
        Record<PredictionTab, PredictionFilters>
    >({
        ai: defaultFilters,
        mine: defaultFilters,
        user: defaultFilters,
    });
    const filters = useMemo(
        () => ({
            ...filtersByMode[mode],
            ...initialFilters,
        }),
        [filtersByMode, initialFilters, mode],
    );

    const visitFilters = (query: Record<string, string>) => {
        router.get(
            predictionsRoute.url({ query }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    };

    const filteredFixtures = useMemo(() => {
        const matches = fixtures.data.filter((match) =>
            matchesFilters(mode, match, filters),
        );

        return sortByConfidence(mode, matches, filters.confidenceSort);
    }, [fixtures.data, filters, mode]);
    const hasActiveFilters = hasActivePredictionFilters(filters);
    const hasFilteredResults = filteredFixtures.length > 0;
    const hasNoFilteredResults = hasActiveFilters && !hasFilteredResults;
    const clearFilters = () => {
        setFiltersByMode((current) => ({
            ...current,
            [mode]: defaultPredictionFilters,
        }));

        if (
            filters.date !== '' ||
            filters.status !== 'all' ||
            filters.pointsState !== 'all'
        ) {
            visitFilters({ mode });
        }
    };

    const syncedQueryFilters = (
        nextFilters: PredictionFilters,
    ): Record<string, string> => ({
        mode,
        ...(nextFilters.date === '' ? {} : { date: nextFilters.date }),
        ...(nextFilters.status === 'all' ? {} : { status: nextFilters.status }),
        ...(nextFilters.pointsState === 'all'
            ? {}
            : { pointsState: nextFilters.pointsState }),
    });

    const updateFilter = <K extends keyof PredictionFilters>(
        key: K,
        value: PredictionFilters[K],
    ) => {
        setFiltersByMode((current) => ({
            ...current,
            [mode]: {
                ...current[mode],
                [key]: value,
            },
        }));

        if (key === 'date' || key === 'status' || key === 'pointsState') {
            const nextFilters = {
                ...filters,
                [key]: value,
            };

            visitFilters(syncedQueryFilters(nextFilters));
        }
    };
    const applyQuickAll = () => {
        const nextFilters = {
            ...filters,
            date: '',
            status: 'all' as const,
        };

        setFiltersByMode((current) => ({
            ...current,
            [mode]: nextFilters,
        }));

        visitFilters(syncedQueryFilters(nextFilters));
    };
    const updateMatchStatusFilter = (
        status: PredictionStatusFilter,
        date: string,
    ) => {
        const nextFilters = {
            ...filters,
            date,
            status,
        };

        setFiltersByMode((current) => ({
            ...current,
            [mode]: nextFilters,
        }));

        visitFilters(syncedQueryFilters(nextFilters));
    };

    return (
        <>
            <PageHead
                title={isPersonal ? 'Mijn voorspellingen' : 'AI-voorspellingen'}
                description={
                    isPersonal
                        ? 'Volg je eigen voetbalvoorspellingen en bekijk de resultaten.'
                        : 'Bekijk AI-analyses, winstkansen en verwachte uitslagen op basis van wedstrijddata.'
                }
            />

            <div className="mx-auto max-w-7xl">
                <PredictionPageHeader
                    isPersonal={isPersonal}
                    scoringGuideHref={scoringGuideHref}
                />

                <PredictionToolbar
                    isPersonal={isPersonal}
                    filters={filters}
                    hasActiveFilters={hasActiveFilters}
                    onChange={updateFilter}
                    onQuickAll={applyQuickAll}
                    onMatchStatusChange={updateMatchStatusFilter}
                    onClear={clearFilters}
                />
                <div
                    aria-busy={loading}
                    className={
                        loading
                            ? 'opacity-60 transition-opacity'
                            : 'transition-opacity'
                    }
                >
                    <p role="status" className="sr-only">
                        {loading
                            ? 'Voorspellingen laden…'
                            : `${filteredFixtures.length} voorspellingen op deze pagina`}
                    </p>
                    {!isPersonal ? (
                        <AnalysisFeed
                            matches={filteredFixtures}
                            hasActiveFilters={hasActiveFilters}
                            confidenceSort={filters.confidenceSort}
                            onClear={clearFilters}
                        />
                    ) : hasNoFilteredResults ? (
                        <EmptyFilteredPredictionsState onClear={clearFilters} />
                    ) : (
                        <PredictionList
                            matches={filteredFixtures}
                            mode={mode}
                            emptyMessage={
                                mode === 'mine'
                                    ? 'You have not predicted any matches yet.'
                                    : 'No AI predictions available yet.'
                            }
                            actionLabel={
                                mode === 'mine'
                                    ? 'View prediction'
                                    : 'View insights'
                            }
                        />
                    )}
                </div>
                <Pagination links={fixtures.links} />
                {isPersonal ? (
                    <PredictionInfoGrid />
                ) : (
                    <aside
                        aria-label="Over de modeluitkomsten"
                        className="mt-10 max-w-3xl text-xs leading-6 text-muted-foreground"
                    >
                        <p>
                            <strong className="font-semibold text-text-secondary">
                                Zo lees je de analyse.
                            </strong>{' '}
                            De percentages beschrijven de kansen op winst,
                            gelijkspel en verlies. Confidence is de inschatting
                            van het model bij de voorspelling, niet de winstkans
                            van een ploeg. De verwachte uitslag is een
                            voorspelde score, geen xG-meting.
                        </p>
                    </aside>
                )}
            </div>
        </>
    );
}
