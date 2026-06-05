import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Pagination from '@/components/navigation/pagination';
import EmptyFilteredPredictionsState from '@/components/predictions/empty-filtered-predictions-state';
import PredictionInfoGrid from '@/components/predictions/prediction-info-grid';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionPageHeader from '@/components/predictions/prediction-page-header';
import PredictionTabs from '@/components/predictions/prediction-tabs';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import PredictionsFilterCard from '@/components/predictions/predictions-filter-card';
import PageHead from '@/components/seo/page-head';
import { predictions as predictionsRoute } from '@/routes';
import type { PredictionPageProps as Props } from '@/types/prediction';
import type { PredictionFilters } from '@/types/prediction-filter';
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
    const defaultFilters = {
        ...defaultPredictionFilters,
        status: initialFilters.status,
    };
    const [filtersByMode, setFiltersByMode] = useState<
        Record<PredictionTab, PredictionFilters>
    >({
        ai: defaultFilters,
        mine: defaultFilters,
    });
    const filters = filtersByMode[mode];

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

        if (filters.status !== 'all') {
            router.get(
                predictionsRoute.url({
                    query: { mode },
                }),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        }
    };
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

        if (key === 'status') {
            router.get(
                predictionsRoute.url({
                    query: {
                        mode,
                        ...(value === 'all' ? {} : { status: value }),
                    },
                }),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        }
    };

    return (
        <>
            <PageHead
                title="Predictions"
                description="Compare AI-powered football predictions with your own World Cup 2026 picks, confidence levels and scoring progress."
            />

            <div className="mx-auto max-w-7xl">
                <PredictionPageHeader scoringGuideHref={scoringGuideHref} />
                <PredictionInfoGrid />
                <PredictionTabs activeTab={mode} />
                <PredictionsFilterCard
                    mode={mode}
                    filters={filters}
                    hasActiveFilters={hasActiveFilters}
                    onChange={updateFilter}
                    onClear={clearFilters}
                />
                {hasNoFilteredResults ? (
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
                <Pagination links={fixtures.links} />
            </div>
        </>
    );
}
