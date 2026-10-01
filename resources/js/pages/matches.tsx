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
                description="Bekijk het volledige WK 2026-speelschema en filter wedstrijden op team, ronde, datum of status."
            />

            <PageHeader
                eyebrow="WK 2026 · Speelschema"
                title="Wedstrijden"
                description="Vind je volgende match, bekijk de aftraptijd en maak je voorspelling."
                actions={
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground tabular-nums">
                            {fixtures.data.length}
                        </strong>{' '}
                        wedstrijden op deze pagina
                    </p>
                }
            />

            <MatchFilters
                rounds={filterOptions.rounds}
                dates={filterOptions.dates}
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
                <MatchList matches={fixtures.data} />
            </div>
            <Pagination links={fixtures.links} />
        </>
    );
}
