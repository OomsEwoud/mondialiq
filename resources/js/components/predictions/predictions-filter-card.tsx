import { X } from 'lucide-react';
import { predictionFilterLabelClassName } from '@/components/predictions/filters/filter-field-label';
import FilterSelect from '@/components/predictions/filters/filter-select';
import MatchStatusSegmentedFilter from '@/components/predictions/filters/match-status-segmented-filter';
import SearchInput from '@/components/predictions/filters/search-input';

import type {
    ConfidenceSort,
    OutcomeFilter,
    PointsStateFilter,
    PredictionFilterOption,
    PredictionFilters,
    PredictionStatusFilter,
} from '@/types/prediction-filter';
import { toDateKey } from '@/utils/date';

type MatchStatusSegmentValue = PredictionStatusFilter | 'today';

interface Props {
    filters: PredictionFilters;
    hasActiveFilters: boolean;
    onChange: <K extends keyof PredictionFilters>(
        key: K,
        value: PredictionFilters[K],
    ) => void;
    onQuickAll: () => void;
    onMatchStatusChange: (status: PredictionStatusFilter, date: string) => void;
    onClear: () => void;
}

const outcomeOptions: PredictionFilterOption<OutcomeFilter>[] = [
    { label: 'All outcomes', value: 'all' },
    { label: 'Home win', value: 'home' },
    { label: 'Draw', value: 'draw' },
    { label: 'Away win', value: 'away' },
];

const pointsStateOptions: PredictionFilterOption<PointsStateFilter>[] = [
    { label: 'All', value: 'all' },
    { label: 'Points awarded', value: 'points-earned' },
    { label: 'Awaiting validation', value: 'points-pending' },
];

const confidenceSortOptions: PredictionFilterOption<ConfidenceSort>[] = [
    { label: 'Default', value: 'default' },
    { label: 'Confidence: high to low', value: 'confidence-desc' },
    { label: 'Confidence: low to high', value: 'confidence-asc' },
];

export default function PredictionsFilterCard({
    filters,
    hasActiveFilters,
    onChange,
    onQuickAll,
    onMatchStatusChange,
    onClear,
}: Props) {
    const today = toDateKey(new Date());
    const matchStatusValue: MatchStatusSegmentValue =
        filters.date === today ? 'today' : filters.status;
    const updateMatchStatus = (value: MatchStatusSegmentValue) => {
        if (value === 'all') {
            onQuickAll();

            return;
        }

        if (value === 'today') {
            onMatchStatusChange('all', today);

            return;
        }

        onMatchStatusChange(value, '');
    };

    return (
        <section className="mb-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className={predictionFilterLabelClassName}>Filters</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Find predictions by match status, date, round or team.
                    </p>
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <X className="size-4" />
                        Clear filters
                    </button>
                )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
                <SearchInput
                    className="lg:col-span-4"
                    value={filters.search}
                    onChange={(value) => onChange('search', value)}
                />
                <MatchStatusSegmentedFilter
                    className="lg:col-span-8"
                    value={matchStatusValue}
                    onChange={updateMatchStatus}
                />
                <FilterSelect
                    className="lg:col-span-4"
                    label="Outcome"
                    value={filters.outcome}
                    options={outcomeOptions}
                    onChange={(value) => onChange('outcome', value)}
                />
                <FilterSelect
                    className="lg:col-span-4"
                    label="Confidence"
                    value={filters.confidenceSort}
                    options={confidenceSortOptions}
                    onChange={(value) => onChange('confidenceSort', value)}
                />
                <FilterSelect
                    className="lg:col-span-4"
                    label="Points state"
                    value={filters.pointsState}
                    options={pointsStateOptions}
                    onChange={(value) => onChange('pointsState', value)}
                />
            </div>
        </section>
    );
}
