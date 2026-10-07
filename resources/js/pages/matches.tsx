import { router } from '@inertiajs/react';
import { useState } from 'react';
import MatchesController from '@/actions/App/Http/Controllers/Pages/MatchesController';
import MatchFilters from '@/components/matches/match-filters';
import MatchList from '@/components/matches/match-list';
import Pagination from '@/components/navigation/pagination';
import PageHead from '@/components/seo/page-head';
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

            <div className="mx-auto w-full max-w-5xl">
                <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="mq-page-title">Wedstrijden</h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Bekijk aankomende wedstrijden, resultaten en
                            AI-analyses.
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">
                            {fixtures.total}
                        </span>{' '}
                        wedstrijden
                    </p>
                </header>

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
            </div>
        </>
    );
}
