import { router } from '@inertiajs/react';
import { useState } from 'react';
import MatchesController from '@/actions/App/Http/Controllers/Pages/MatchesController';
import MatchFilters from '@/components/matches/match-filters';
import MatchList from '@/components/matches/match-list';
import Pagination from '@/components/navigation/pagination';
import PageHead from '@/components/seo/page-head';
import PageHeader from '@/components/typography/page-header';
import { emptyFilters } from '@/const/match';
import type {
    FilterKey,
    Filters,
    MatchPageProps as Props,
} from '@/types/match-page';
import { filledMatchFilters } from '@/utils/match-filters';

export default function Matches({ fixtures, filterOptions, filters }: Props) {
    const [loading, setLoading] = useState(false);
    const visit = (nextFilters: Filters) => {
        const query = filledMatchFilters(nextFilters);
        const url = Object.keys(query).length
            ? MatchesController.url({ query })
            : MatchesController.url();

        router.visit(url, {
            method: 'get',
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

    const handleFilterChange = (
        key: FilterKey,
        value: string | Filters['status'],
    ) => {
        visit({ ...filters, [key]: value });
    };
    const handleQuickFiltersChange = (
        values: Pick<Filters, 'date' | 'status'>,
    ) => {
        visit({ ...filters, ...values });
    };

    return (
        <>
            <PageHead
                title="Wedstrijden"
                description="Bekijk aankomende wedstrijden, resultaten en AI-analyses. Filter wedstrijden op ploeg, ronde, datum of status."
            />

            <PageHeader
                variant="top-level"
                eyebrow="Wedstrijdprogramma"
                title="Wedstrijden"
                description="Bekijk aankomende wedstrijden, resultaten en AI-analyses."
                actions={
                    <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">
                            {fixtures.total}
                        </span>{' '}
                        wedstrijden
                    </p>
                }
            />

            <MatchFilters
                rounds={filterOptions.rounds}
                teams={filterOptions.teams}
                selected={filters}
                onChange={handleFilterChange}
                onQuickChange={handleQuickFiltersChange}
                onClear={() => visit(emptyFilters)}
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
                        ? 'Wedstrijden laden…'
                        : `${fixtures.data.length} wedstrijden gevonden`}
                </p>
                <MatchList
                    matches={fixtures.data}
                    onClear={() => visit(emptyFilters)}
                />
            </div>
            <Pagination links={fixtures.links} />
        </>
    );
}
