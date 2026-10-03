import { Link } from '@inertiajs/react';
import AnalysisEntry from '@/components/predictions/analysis-entry';
import { matches as matchesRoute } from '@/routes';
import type { Match } from '@/types/match';
import type { ConfidenceSort } from '@/types/prediction-filter';

interface Props {
    matches: Match[];
    hasActiveFilters: boolean;
    confidenceSort: ConfidenceSort;
    onClear: () => void;
}

export default function AnalysisFeed({
    matches,
    hasActiveFilters,
    confidenceSort,
    onClear,
}: Props) {
    if (matches.length === 0) {
        return (
            <section className="flex min-h-44 flex-col items-center justify-center border-y border-[#262c29] py-6 text-center">
                <h2 className="text-base font-semibold text-[#f3f4f1]">
                    {hasActiveFilters
                        ? 'Geen analyses gevonden'
                        : 'Nog geen AI-analyses beschikbaar'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#949d97]">
                    {hasActiveFilters
                        ? 'Pas je filters aan of zoek een andere ploeg.'
                        : 'Nieuwe voorspellingen verschijnen hier zodra het model ze heeft opgesteld.'}
                </p>
                {hasActiveFilters ? (
                    <button
                        type="button"
                        onClick={onClear}
                        className="mt-2 min-h-11 rounded-sm text-sm font-semibold text-[#9ecbad] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                    >
                        Filters wissen
                    </button>
                ) : (
                    <Link
                        href={matchesRoute()}
                        className="mt-2 inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-[#9ecbad] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                    >
                        Bekijk het programma →
                    </Link>
                )}
            </section>
        );
    }

    const groups =
        confidenceSort === 'default'
            ? Map.groupBy(matches, (match) => match.dateValue)
            : new Map([['confidence', matches]]);

    return (
        <div className="space-y-10 sm:space-y-12">
            {Array.from(groups, ([date, fixtures]) => (
                <section key={date} aria-labelledby={`analysis-date-${date}`}>
                    <h2
                        id={`analysis-date-${date}`}
                        className="mb-2 text-xs font-semibold tracking-[0.12em] text-[#949d97] uppercase"
                    >
                        {date === 'confidence' ? (
                            'Gesorteerd op confidence'
                        ) : (
                            <time dateTime={date}>
                                {new Intl.DateTimeFormat('nl-BE', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                }).format(new Date(`${date}T00:00:00`))}
                            </time>
                        )}
                    </h2>
                    <div className="divide-y divide-[#262c29] border-y border-[#262c29]">
                        {fixtures.map((match) => (
                            <AnalysisEntry
                                key={match.id}
                                match={match}
                                showDate={confidenceSort !== 'default'}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
