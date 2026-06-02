import { router } from '@inertiajs/react';
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
            <PageHead
                title="Matches"
                description="Browse the complete World Cup 2026 match schedule, filter fixtures by team, round, date and status, and open each match for details and predictions."
            />

            <header className="mb-6 overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.22),transparent_24rem),linear-gradient(135deg,#0b1748_0%,#14236f_58%,#0e7490_150%)] px-6 py-8 text-center shadow-2xl shadow-blue-950/15 sm:mb-8 sm:px-8 sm:py-10">
                <p className="text-xs font-black tracking-[0.24em] text-cyan-100 uppercase">
                    World Cup 2026 schedule
                </p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
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
