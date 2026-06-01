import { Head, router } from '@inertiajs/react';
import MatchesController from '@/actions/App/Http/Controllers/Pages/MatchesController';
import MatchFilters from '@/components/matches/match-filters';
import MatchList from '@/components/matches/match-list';
import Pagination from '@/components/navigation/pagination';
import { emptyFilters } from '@/const/match';
import type {
    FilterKey,
    Filters,
    MatchPageProps as Props,
} from '@/types/match-page';
import { filledMatchFilters } from '@/utils/match-filters';

export default function Matches({ fixtures, filterOptions, filters }: Props) {
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
        });
    };

    const handleFilterChange = (
        key: FilterKey,
        value: string | Filters['status'],
    ) => {
        visit({ ...filters, [key]: value });
    };

    return (
        <>
            <Head title="Matches" />

            <header className="mb-6 text-center sm:mb-8">
                <p className="text-xs font-black tracking-widest text-cyan-600 uppercase">
                    World Cup 2026 schedule
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    All Matches
                </h1>
            </header>

            <MatchFilters
                rounds={filterOptions.rounds}
                dates={filterOptions.dates}
                teams={filterOptions.teams}
                selected={filters}
                onChange={handleFilterChange}
                onClear={() => visit(emptyFilters)}
            />

            <MatchList matches={fixtures.data} />
            <Pagination links={fixtures.links} />
        </>
    );
}
