import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useId, useState } from 'react';
import DatePicker from '@/components/filters/date-picker';
import FilterSelect from '@/components/predictions/filters/filter-select';
import { cn } from '@/lib/utils';
import type {
    PredictionFilters,
    PredictionStatusFilter,
} from '@/types/prediction-filter';
import { toDateKey } from '@/utils/date';

interface Props {
    filters: PredictionFilters;
    isPersonal: boolean;
    hasActiveFilters: boolean;
    onChange: <K extends keyof PredictionFilters>(
        key: K,
        value: PredictionFilters[K],
    ) => void;
    onQuickAll: () => void;
    onMatchStatusChange: (status: PredictionStatusFilter, date: string) => void;
    onClear: () => void;
}

export default function PredictionToolbar({
    filters,
    isPersonal,
    hasActiveFilters,
    onChange,
    onQuickAll,
    onMatchStatusChange,
    onClear,
}: Props) {
    const [expanded, setExpanded] = useState(false);
    const advancedId = useId();
    const today = toDateKey(new Date());
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const tomorrow = toDateKey(nextDay);
    const dates = [
        { label: 'Vandaag', value: today },
        { label: 'Morgen', value: tomorrow },
        { label: 'Alles', value: '' },
    ];
    const advancedCount =
        Number(
            Boolean(
                filters.date &&
                filters.date !== today &&
                filters.date !== tomorrow,
            ),
        ) +
        Number(filters.status !== 'all') +
        Number(filters.outcome !== 'all') +
        Number(filters.confidenceSort !== 'default') +
        Number(filters.pointsState !== 'all');

    return (
        <section aria-label="Voorspellingen filteren" className="mb-10">
            <div
                role="group"
                aria-label="Periode"
                className="flex gap-7 border-b border-border-subtle"
            >
                {dates.map(({ label, value }) => (
                    <button
                        key={label}
                        type="button"
                        aria-pressed={
                            filters.date === value && filters.status === 'all'
                        }
                        onClick={() =>
                            value
                                ? onMatchStatusChange('all', value)
                                : onQuickAll()
                        }
                        className={cn(
                            'min-h-11 border-b-2 px-0.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            filters.date === value && filters.status === 'all'
                                ? 'border-primary text-positive'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
                <div className="relative min-w-0 flex-1 sm:max-w-sm">
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary"
                    />
                    <input
                        type="search"
                        aria-label="Zoek een ploeg"
                        placeholder="Zoek een ploeg…"
                        value={filters.search}
                        onChange={(event) =>
                            onChange('search', event.target.value)
                        }
                        className="h-11 w-full rounded-md border border-border-subtle bg-transparent pr-3 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    />
                </div>
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={advancedId}
                    onClick={() => setExpanded((isOpen) => !isOpen)}
                    className={cn(
                        'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors duration-200 hover:bg-surface-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:ml-auto',
                        expanded || advancedCount
                            ? 'border-border-strong bg-brand-subtle text-positive'
                            : 'border-border-strong bg-surface text-text-secondary hover:border-border-strong hover:text-foreground',
                    )}
                >
                    <SlidersHorizontal className="size-4" aria-hidden="true" />
                    {advancedCount > 0 && (
                        <>
                            <span>Filters</span>
                            <span
                                aria-label={`${advancedCount} actief`}
                                className="text-xs text-positive tabular-nums"
                            >
                                · {advancedCount}
                            </span>
                        </>
                    )}
                    {advancedCount === 0 && <span>Filters</span>}
                    <ChevronDown
                        className={cn(
                            'size-4 transition-transform duration-200',
                            expanded && 'rotate-180',
                        )}
                        aria-hidden="true"
                    />
                </button>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <X className="size-3.5" aria-hidden="true" />
                        Filters wissen
                    </button>
                )}
            </div>
            <div
                id={advancedId}
                aria-hidden={!expanded}
                inert={!expanded}
                className={cn(
                    'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
                    expanded
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'pointer-events-none grid-rows-[0fr] opacity-0',
                )}
            >
                <div
                    className={cn(
                        'min-h-0',
                        expanded ? 'overflow-visible' : 'overflow-hidden',
                    )}
                >
                    <div className="grid gap-4 border-t border-border-subtle pt-5 sm:grid-cols-2 lg:grid-cols-4">
                        <DatePicker
                            label="Datum"
                            selected={filters.date}
                            onChange={(value) => onChange('date', value)}
                        />
                        <FilterSelect
                            label="Wedstrijdstatus"
                            value={filters.status}
                            options={[
                                { label: 'Alle wedstrijden', value: 'all' },
                                { label: 'Binnenkort', value: 'upcoming' },
                                { label: 'Gestart / afgelopen', value: 'past' },
                            ]}
                            onChange={(value) => onChange('status', value)}
                        />
                        <FilterSelect
                            label="Voorspelde winnaar"
                            value={filters.outcome}
                            options={[
                                { label: 'Alle uitkomsten', value: 'all' },
                                { label: 'Thuisploeg', value: 'home' },
                                { label: 'Gelijkspel', value: 'draw' },
                                { label: 'Uitploeg', value: 'away' },
                            ]}
                            onChange={(value) => onChange('outcome', value)}
                        />
                        <FilterSelect
                            label="Sorteer op confidence"
                            value={filters.confidenceSort}
                            options={[
                                { label: 'Op datum', value: 'default' },
                                {
                                    label: 'Hoog naar laag',
                                    value: 'confidence-desc',
                                },
                                {
                                    label: 'Laag naar hoog',
                                    value: 'confidence-asc',
                                },
                            ]}
                            onChange={(value) =>
                                onChange('confidenceSort', value)
                            }
                        />
                        {(isPersonal || filters.pointsState !== 'all') && (
                            <FilterSelect
                                label="Puntenstatus"
                                value={filters.pointsState}
                                options={[
                                    {
                                        label: 'Alle voorspellingen',
                                        value: 'all',
                                    },
                                    {
                                        label: 'Punten toegekend',
                                        value: 'points-earned',
                                    },
                                    {
                                        label: 'Nog te beoordelen',
                                        value: 'points-pending',
                                    },
                                    {
                                        label: 'Geen punten behaald',
                                        value: 'no-points-earned',
                                    },
                                ]}
                                onChange={(value) =>
                                    onChange('pointsState', value)
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Zoeken, winnaar en sortering gelden voor deze pagina.
            </p>
        </section>
    );
}
