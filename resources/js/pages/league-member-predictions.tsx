import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Crown, Target, Trophy, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import Pagination from '@/components/navigation/pagination';
import EmptyFilteredPredictionsState from '@/components/predictions/empty-filtered-predictions-state';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionsFilterCard from '@/components/predictions/predictions-filter-card';
import PageHead from '@/components/seo/page-head';
import { Badge } from '@/components/ui/feedback/badge';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import leagueMemberRoute from '@/routes/leagues/member';
import type { LeagueMemberPredictionsPageProps as Props } from '@/types/prediction';
import type {
    PredictionFilters,
    PredictionStatusFilter,
} from '@/types/prediction-filter';
import {
    getLeagueThemeBannerClass,
    getLeagueThemePalette,
} from '@/utils/league-branding';
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
    const theme = getLeagueThemePalette(league.accentColor);
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
        ? 'No predictions in this group yet. Predictions made outside this group are not shown here.'
        : 'No predictions in this group yet. Predictions made outside this group are not shown here.';

    const heroStats = [
        {
            label: 'Predictions',
            value: `${member.predictionsCount}`,
            icon: Target,
        },
        {
            label: 'Points',
            value: `${member.totalPoints}`,
            icon: Trophy,
        },
        {
            label: 'Group',
            value: league.name,
            icon: Users,
        },
        {
            label: 'Role',
            value: member.isViewer ? 'You' : 'Member',
            icon: member.isViewer ? Crown : Users,
        },
    ];

    return (
        <>
            <PageHead title={pageTitle} description={pageDescription} />

            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <section
                    className={cn(
                        'relative overflow-hidden rounded-2xl p-4 text-white shadow-sm ring-1 sm:p-6 lg:p-8',
                        getLeagueThemeBannerClass(league.accentColor),
                    )}
                >
                    <div className="flex items-start justify-between">
                        <Link
                            href={league.showHref}
                            className={cn(
                                'inline-flex w-fit items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700/50 hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none',
                                theme.buttonRing,
                            )}
                        >
                            <ArrowLeft className="size-4" />
                            Back to group
                        </Link>

                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-800/50 text-2xl shadow-sm ring-1 sm:size-14 sm:text-3xl',
                                    theme.badgeBorder,
                                )}
                            >
                                {member.avatar ? (
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="size-12 rounded-xl object-cover sm:size-14"
                                    />
                                ) : (
                                    <span
                                        aria-hidden="true"
                                        className="text-sm font-bold text-slate-200 sm:text-base"
                                    >
                                        {getInitials(member.name)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p
                                className={cn(
                                    'text-xs font-semibold tracking-wide uppercase',
                                    theme.accentText,
                                )}
                            >
                                Group Member Predictions
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                                {pageTitle}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                                {pageDescription}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {heroStats.map((stat) => (
                            <Badge
                                key={stat.label}
                                variant="outline"
                                className={cn(
                                    'w-full justify-center rounded-full px-3 py-1.5 text-xs font-semibold',
                                    theme.badgeBorder,
                                    theme.badgeBg,
                                    theme.badgeText,
                                    stat.label === 'Role' &&
                                        member.isViewer &&
                                        'border-white bg-white text-slate-900',
                                )}
                            >
                                <stat.icon
                                    className={cn(
                                        'mr-1.5 size-3.5 shrink-0',
                                        stat.label === 'Role' && member.isViewer
                                            ? 'text-slate-900'
                                            : theme.iconColor,
                                    )}
                                />
                                <span className="truncate">
                                    {stat.label}: {stat.value}
                                </span>
                            </Badge>
                        ))}
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
