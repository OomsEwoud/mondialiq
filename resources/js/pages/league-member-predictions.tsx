import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import Pagination from '@/components/navigation/pagination';
import EmptyFilteredPredictionsState from '@/components/predictions/empty-filtered-predictions-state';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionsFilterCard from '@/components/predictions/predictions-filter-card';
import PageHead from '@/components/seo/page-head';
import { Badge } from '@/components/ui/feedback/badge';
import { useInitials } from '@/hooks/use-initials';
import leagueMemberRoute from '@/routes/leagues/member';
import type { LeagueMemberPredictionsPageProps as Props } from '@/types/prediction';
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

export default function LeagueMemberPredictions({
    league,
    member,
    fixtures,
    filters: initialFilters,
}: Props) {
    const getInitials = useInitials();
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
                leagueMemberRoute.predictions.url({
                    scoreboard: league.id,
                    user: member.id,
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
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));

        if (key === 'date' || key === 'status' || key === 'pointsState') {
            router.get(
                leagueMemberRoute.predictions.url({
                    scoreboard: league.id,
                    user: member.id,
                }),
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
            leagueMemberRoute.predictions.url({
                scoreboard: league.id,
                user: member.id,
            }),
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
            leagueMemberRoute.predictions.url({
                scoreboard: league.id,
                user: member.id,
            }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const pageTitle = member.isViewer
        ? 'My predictions'
        : `${member.name}'s Predictions`;
    const pageDescription = member.isViewer
        ? `Predictions shared in ${league.name}.`
        : `Predictions shared by ${member.name} in ${league.name}.`;
    const emptyMessage = member.isViewer
        ? 'You have not made predictions in this group yet.'
        : 'This member has not made predictions in this group yet.';

    return (
        <>
            <PageHead
                title={pageTitle}
                description={pageDescription}
            />

            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        {member.avatar ? (
                            <img
                                src={member.avatar}
                                alt={member.name}
                                className="size-14 rounded-full object-cover ring-2 ring-slate-200 shadow-sm sm:size-16"
                            />
                        ) : (
                            <div className="flex size-14 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-slate-200 ring-2 ring-slate-200 shadow-sm sm:size-16 sm:text-base">
                                {getInitials(member.name)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                {pageTitle}
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-500">
                                {pageDescription}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-none">
                                    {member.predictionsCount}{' '}
                                    {member.predictionsCount === 1
                                        ? 'prediction'
                                        : 'predictions'}
                                </Badge>
                                <Badge className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 shadow-none">
                                    {member.totalPoints} points
                                </Badge>
                                <Badge className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 shadow-none">
                                    <Users className="mr-1 size-3" />
                                    {league.name}
                                </Badge>
                                <Badge className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600 shadow-none">
                                    Group member
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={league.showHref}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" />
                        Back to group
                    </Link>
                </div>

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
                        userId={member.id}
                        emptyMessage={emptyMessage}
                        actionLabel="See insights"
                    />
                )}
                <Pagination links={fixtures.links} />
            </div>
        </>
    );
}
