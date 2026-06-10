import { router } from '@inertiajs/react';
import { ArrowLeft, Bot } from 'lucide-react';
import { useMemo, useState } from 'react';
import Pagination from '@/components/navigation/pagination';
import EmptyFilteredPredictionsState from '@/components/predictions/empty-filtered-predictions-state';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionsFilterCard from '@/components/predictions/predictions-filter-card';
import PageHead from '@/components/seo/page-head';
import { predictions as aiPredictionsRoute } from '@/routes/ai';
import type { AiPredictionsPageProps as Props } from '@/types/prediction';
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

export default function AiPredictions({
    aiUser,
    fixtures,
    filters: initialFilters,
}: Props) {
    const defaultFilters = {
        ...defaultPredictionFilters,
        date: initialFilters.date,
        status: initialFilters.status,
        pointsState: initialFilters.pointsState,
    };
    const [filters, setFilters] = useState<PredictionFilters>(defaultFilters);

    const filteredFixtures = useMemo(() => {
        const matches = fixtures.data.filter((match) =>
            matchesFilters('ai', match, filters),
        );

        return sortByConfidence('ai', matches, filters.confidenceSort);
    }, [fixtures.data, filters]);
    const hasActiveFilters = hasActivePredictionFilters(filters);
    const hasFilteredResults = filteredFixtures.length > 0;
    const hasNoFilteredResults = hasActiveFilters && !hasFilteredResults;
    const clearFilters = () => {
        setFilters(defaultPredictionFilters);

        if (
            filters.date !== '' ||
            filters.status !== 'all' ||
            filters.pointsState !== 'all'
        ) {
            router.get(
                aiPredictionsRoute.url(),
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
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));

        if (key === 'date' || key === 'status' || key === 'pointsState') {
            router.get(
                aiPredictionsRoute.url(),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        }
    };
    const applyQuickAll = () => {
        const nextFilters = {
            ...filters,
            date: '',
            status: 'all' as const,
        };

        setFilters(nextFilters);

        router.get(
            aiPredictionsRoute.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
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

        setFilters(nextFilters);

        router.get(
            aiPredictionsRoute.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const pageTitle = 'MondialiQ AI Predictions';
    const pageDescription =
        "Explore MondialiQ AI's World Cup predictions and match insights.";
    const emptyMessage = 'No AI predictions available yet.';

    return (
        <>
            <PageHead title={pageTitle} description={pageDescription} />

            <div className="mx-auto max-w-7xl">
                <section className="mb-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-lg sm:p-8">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-600/50 bg-slate-800/50 text-xl font-bold text-slate-200 shadow-sm ring-1 ring-slate-600/50 sm:size-16 sm:text-2xl">
                                {aiUser.avatar ? (
                                    <img
                                        src={aiUser.avatar}
                                        alt={aiUser.name}
                                        className="size-14 rounded-xl object-cover sm:size-16"
                                    />
                                ) : (
                                    <span className="flex size-full items-center justify-center bg-emerald-500/20 text-emerald-400">
                                        <Bot className="size-6 sm:size-8" />
                                    </span>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                                    AI match insights
                                </p>
                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    {pageTitle}
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                                    {pageDescription}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2.5">
                                    <span className="rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300">
                                        Data-driven insights
                                    </span>
                                    <span className="rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300">
                                        Machine learning
                                    </span>
                                    <span className="rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300">
                                        Match predictions
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-5 py-3 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none sm:w-auto"
                            >
                                <ArrowLeft className="size-4" />
                                Back
                            </button>
                        </div>
                    </div>
                </section>

                <PredictionsFilterCard
                    filters={filters}
                    hasActiveFilters={hasActiveFilters}
                    onChange={updateFilter}
                    onQuickAll={applyQuickAll}
                    onMatchStatusChange={updateMatchStatusFilter}
                    onClear={clearFilters}
                />
                {hasNoFilteredResults ? (
                    <EmptyFilteredPredictionsState onClear={clearFilters} />
                ) : (
                    <PredictionList
                        matches={filteredFixtures}
                        mode="ai"
                        emptyMessage={emptyMessage}
                        actionLabel="See insights"
                    />
                )}
                <Pagination links={fixtures.links} />
            </div>
        </>
    );
}
