import { router } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
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
    const handleQuickFiltersChange = (
        values: Pick<Filters, 'date' | 'status'>,
    ) => {
        visit({ ...filters, ...values });
    };

    return (
        <>
            <PageHead
                title="Wedstrijden"
                description="Bekijk het volledige WK 2026-speelschema en filter wedstrijden op team, ronde, datum of status."
            />

            <header className="mb-8 border-b border-[#29312c] pb-8 sm:mb-10 sm:pb-10">
                <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="flex items-center gap-2 text-xs font-bold text-[#70b98e] uppercase">
                            <span className="size-1.5 rounded-full bg-[#57ad78]" />
                            WK 2026 · Speelschema
                        </p>
                        <h1 className="mt-4 max-w-2xl text-4xl leading-[1.05] font-black text-[#f3f4f1] sm:text-6xl">
                            Alle wedstrijden.
                            <span className="block text-[#a9bdb1]">
                                Eén helder overzicht.
                            </span>
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-[#9aa29d]">
                            Vind je volgende match, bekijk de aftraptijd en open
                            de voorspelling zodra die klaarstaat.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 border-l-2 border-[#57ad78] pl-4 lg:mb-1">
                        <CalendarDays className="size-5 text-[#70b98e]" />
                        <div>
                            <p className="text-2xl font-black text-[#f3f4f1] tabular-nums">
                                {fixtures.data.length}
                            </p>
                            <p className="text-xs font-semibold text-[#89928c]">
                                wedstrijden op deze pagina
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <MatchFilters
                rounds={filterOptions.rounds}
                dates={filterOptions.dates}
                teams={filterOptions.teams}
                selected={filters}
                onChange={handleFilterChange}
                onQuickChange={handleQuickFiltersChange}
                onClear={() => visit(emptyFilters)}
            />

            <MatchList matches={fixtures.data} />
            <Pagination links={fixtures.links} />
        </>
    );
}
