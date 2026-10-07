import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import Pagination from '@/components/navigation/pagination';
import EmptyFilteredPredictionsState from '@/components/predictions/empty-filtered-predictions-state';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionsFilterCard from '@/components/predictions/predictions-filter-card';
import PageHead from '@/components/seo/page-head';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { useInitials } from '@/hooks/use-initials';
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

    const getInitials = useInitials();
    const pageTitle = user.isViewer
        ? 'My public predictions'
        : `${user.name}'s Predictions`;
    const pageDescription = user.isViewer
        ? 'Explore your public football predictions and match insights.'
        : `Explore ${user.name}'s football predictions and match insights.`;
    const emptyMessage = user.isViewer
        ? 'You have not predicted any matches yet.'
        : 'This user has not shared any predictions yet.';

    return (
        <>
            <PageHead title={pageTitle} description={pageDescription} />

            <div className="mx-auto max-w-7xl">
                <section className="mb-6 overflow-hidden rounded-2xl border border-border/50 bg-secondary p-6 shadow-lg sm:p-8">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/50 text-xl font-bold text-foreground shadow-sm ring-1 ring-border-strong/50 sm:size-16 sm:text-2xl">
                                {user.avatar ? (
                                    <ImageWithFallback
                                        src={user.avatar}
                                        alt={user.name}
                                        className="size-14 rounded-xl object-cover sm:size-16"
                                    />
                                ) : (
                                    <span>{getInitials(user.name)}</span>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                                    {user.isViewer
                                        ? 'My public predictions'
                                        : 'User predictions'}
                                </p>
                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                    {pageTitle}
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                    {pageDescription}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2.5">
                                    <span className="rounded-full border border-border/50 bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                        {user.predictionsCount}{' '}
                                        {user.predictionsCount === 1
                                            ? 'prediction'
                                            : 'predictions'}
                                    </span>
                                    <span className="rounded-full border border-border/50 bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                        {user.totalPoints} points
                                    </span>
                                    <span className="rounded-full border border-border/50 bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                        Public predictions
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/50 bg-muted/50 px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-interactive/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:w-auto"
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
