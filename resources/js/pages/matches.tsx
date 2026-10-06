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
                description="Bekijk het programma, analyses en voorspellingen. Filter wedstrijden op ploeg, ronde, datum of status."
            />

            <header className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                        Wedstrijden · Speelschema
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                        Wedstrijden
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-[#949d97]">
                        Bekijk het programma, analyses en voorspellingen.
                    </p>
                </div>
                <p className="text-xs text-[#949d97]">
                    <span className="font-semibold text-[#daddd9] tabular-nums">
                        {fixtures.data.length}
                    </span>{' '}
                    wedstrijden op deze pagina
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
        </>
    );
}
