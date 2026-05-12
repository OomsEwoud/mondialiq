import { router } from '@inertiajs/react';
import MatchesController from '@/actions/App/Http/Controllers/Pages/MatchesController';
import MatchFilters from '@/components/matches/match-filters';
import MatchList from '@/components/matches/match-list';
import Pagination from '@/components/navigation/pagination';
import { emptyFilters } from '@/const/match';
import type { Filters, MatchPageProps as Props } from '@/types/match-page';

function filledFilters(filters: Filters) {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value.trim() !== ''),
    ) as Partial<Filters>;
}

export default function Matches({ fixtures, filterOptions, filters }: Props) {
    const visit = (nextFilters: Filters) => {
        const query = filledFilters(nextFilters);
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

    return (
        <>
            <h1 className="mb-6 bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-center text-4xl font-bold text-transparent">
                All Matches
            </h1>

            <MatchFilters
                rounds={filterOptions.rounds}
                dates={filterOptions.dates}
                teams={filterOptions.teams}
                selected={filters}
                onChange={(key, value) => visit({ ...filters, [key]: value })}
                onClear={() => visit(emptyFilters)}
            />

            <MatchList matches={fixtures.data} />
            <Pagination links={fixtures.links} />
        </>
    );
}
