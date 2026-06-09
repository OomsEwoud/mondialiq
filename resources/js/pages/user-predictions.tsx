import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Pagination from '@/components/navigation/pagination';
import EmptyFilteredPredictionsState from '@/components/predictions/empty-filtered-predictions-state';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionsFilterCard from '@/components/predictions/predictions-filter-card';
import PageHead from '@/components/seo/page-head';
import { predictions as usersPredictions } from '@/routes/users';
import type { UserPredictionsPageProps as Props } from '@/types/prediction';
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

export default function UserPredictions({
    user,
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
            matchesFilters('user', match, filters),
        );

        return sortByConfidence('user', matches, filters.confidenceSort);
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
                usersPredictions.url(user.id),
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
                usersPredictions.url(user.id),
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
            usersPredictions.url(user.id),
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
            usersPredictions.url(user.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const pageTitle = user.isViewer
        ? 'My public predictions'
        : `${user.name}'s Predictions`;
    const pageDescription = user.isViewer
        ? 'Explore your public World Cup predictions and match insights.'
        : `Explore ${user.name}'s World Cup predictions and match insights.`;
    const emptyMessage = user.isViewer
        ? 'You have not predicted any matches yet.'
        : 'This user has not shared any predictions for the World Cup yet.';

    return (
        <>
            <PageHead
                title={pageTitle}
                description={pageDescription}
            />

            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center gap-3">
                    {user.avatar && (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="size-10 rounded-xl object-cover ring-1 ring-slate-200 shadow-sm"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            {pageTitle}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {pageDescription}
                        </p>
                    </div>
                </div>

                <PredictionsFilterCard
                    mode="user"
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
                        mode="user"
                        userId={user.id}
                        emptyMessage={emptyMessage}
                        actionLabel="See insights"
                    />
                )}
                <Pagination links={fixtures.links} />
            </div>
        </>
    );
}
