import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { FilterKey, Filters, MatchStatusFilter } from '@/types/match-page';
import { toDateKey } from '@/utils/date';
import DateFilter from './filters/date-filter';
import MatchStatusTabs from './filters/match-status-tabs';
import type { MatchStatusTabValue } from './filters/match-status-tabs';
import RoundFilter from './filters/round-filter';
import TeamFilter from './filters/team-filter';

interface Props {
    rounds: Array<{ label: string; value: string }>;
    teams: string[];
    selected: Filters;
    onChange: (key: FilterKey, value: string | MatchStatusFilter) => void;
    onQuickChange: (values: Pick<Filters, 'date' | 'status'>) => void;
    onClear: () => void;
}

export default function MatchFilters({
    rounds,
    teams,
    selected,
    onChange,
    onQuickChange,
    onClear,
}: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const today = toDateKey(new Date());
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = toDateKey(tomorrowDate);
    const hasActiveFilters =
        selected.round ||
        selected.date ||
        selected.team ||
        selected.status !== 'all';
    const advancedFilterCount =
        Number(Boolean(selected.round)) + Number(Boolean(selected.date));
    const selectedMatchStatus: MatchStatusTabValue | null =
        selected.status !== 'all'
            ? selected.status
            : selected.date === today
              ? 'today'
              : selected.date === tomorrow
                ? 'tomorrow'
                : selected.date
                  ? null
                  : 'all';
    const handleMatchStatusChange = (value: MatchStatusTabValue) => {
        if (value === 'today' || value === 'tomorrow') {
            onQuickChange({
                date: value === 'today' ? today : tomorrow,
                status: 'all',
            });

            return;
        }

        onQuickChange({ date: '', status: value });
    };

    return (
        <section aria-label="Wedstrijden filteren" className="mb-10">
            <div className="border-b border-[#262c29]">
                <MatchStatusTabs
                    selected={selectedMatchStatus}
                    onChange={handleMatchStatusChange}
                />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
                <div className="min-w-0 flex-1 sm:max-w-sm">
                    <TeamFilter
                        teams={teams}
                        selected={selected.team}
                        onChange={(value) => onChange('team', value)}
                    />
                </div>
                <button
                    type="button"
                    className={cn(
                        'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors duration-200 hover:bg-[#171c19] focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none sm:ml-auto',
                        showFilters || advancedFilterCount
                            ? 'border-[#4b775d] bg-[#17251d] text-[#9ecbad]'
                            : 'border-[#343d37] bg-[#0d110f] text-[#a8b0ab] hover:border-[#536159] hover:text-white',
                    )}
                    aria-expanded={showFilters}
                    aria-controls="match-extra-filters"
                    onClick={() => setShowFilters((isOpen) => !isOpen)}
                >
                    <SlidersHorizontal className="size-4" aria-hidden="true" />
                    {advancedFilterCount > 0 && (
                        <>
                            <span>Filters</span>
                            <span
                                aria-label={`${advancedFilterCount} actief`}
                                className="text-xs text-[#9ecbad] tabular-nums"
                            >
                                · {advancedFilterCount}
                            </span>
                        </>
                    )}
                    {advancedFilterCount === 0 && <span>Filters</span>}
                    <ChevronDown
                        className={cn(
                            'size-4 transition-transform duration-200',
                            showFilters && 'rotate-180',
                        )}
                        aria-hidden="true"
                    />
                </button>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-xs text-[#949d97] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                    >
                        <X className="size-3.5" aria-hidden="true" />
                        Filters wissen
                    </button>
                )}
            </div>
            <div
                id="match-extra-filters"
                aria-hidden={!showFilters}
                inert={!showFilters}
                className={cn(
                    'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
                    showFilters
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'pointer-events-none grid-rows-[0fr] opacity-0',
                )}
            >
                <div
                    className={cn(
                        'min-h-0',
                        showFilters ? 'overflow-visible' : 'overflow-hidden',
                    )}
                >
                    <div className="grid gap-4 border-t border-[#262c29] pt-5 sm:max-w-2xl sm:grid-cols-2">
                        <RoundFilter
                            rounds={rounds}
                            selected={selected.round}
                            onChange={(value) => onChange('round', value)}
                        />
                        <DateFilter
                            selected={selected.date}
                            onChange={(value) => onChange('date', value)}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
