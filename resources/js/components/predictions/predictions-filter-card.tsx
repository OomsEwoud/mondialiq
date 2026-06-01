import { X } from 'lucide-react';
import { predictionFilterLabelClassName } from '@/components/predictions/filters/filter-field-label';
import FilterSelect from '@/components/predictions/filters/filter-select';
import SearchInput from '@/components/predictions/filters/search-input';
import StatusFilterPills from '@/components/predictions/filters/status-filter-pills';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import type {
    ConfidenceSort,
    OutcomeFilter,
    PointsStateFilter,
    PredictionFilterOption,
    PredictionFilters,
    PredictionStatusFilter,
} from '@/types/prediction-filter';

interface Props {
    mode: PredictionTab;
    filters: PredictionFilters;
    filteredCount: number;
    hasActiveFilters: boolean;
    onChange: <K extends keyof PredictionFilters>(
        key: K,
        value: PredictionFilters[K],
    ) => void;
    onClear: () => void;
}

const statusOptions: PredictionFilterOption<PredictionStatusFilter>[] = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Past', value: 'past' },
];

const outcomeOptions: PredictionFilterOption<OutcomeFilter>[] = [
    { label: 'All outcomes', value: 'all' },
    { label: 'Home win', value: 'home' },
    { label: 'Draw', value: 'draw' },
    { label: 'Away win', value: 'away' },
];

const pointsStateOptions: PredictionFilterOption<PointsStateFilter>[] = [
    { label: 'All', value: 'all' },
    { label: 'Points pending', value: 'points-pending' },
    { label: 'Points earned', value: 'points-earned' },
];

const confidenceSortOptions: PredictionFilterOption<ConfidenceSort>[] = [
    { label: 'Default', value: 'default' },
    { label: 'Confidence: high to low', value: 'confidence-desc' },
    { label: 'Confidence: low to high', value: 'confidence-asc' },
];

export default function PredictionsFilterCard({
    mode,
    filters,
    filteredCount,
    hasActiveFilters,
    onChange,
    onClear,
}: Props) {
    const isMine = mode === 'mine';

    return (
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-blue-950/5 backdrop-blur sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <p className={predictionFilterLabelClassName}>Filters</p>
                    <h2 className="mt-1 text-lg font-black text-blue-950">
                        Find predictions faster
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Search and refine predictions by status, outcome or
                        confidence.
                    </p>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                    <p className="text-sm font-black whitespace-nowrap text-blue-950">
                        Showing {filteredCount}{' '}
                        {filteredCount === 1 ? 'prediction' : 'predictions'}
                    </p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                            <X className="size-4" />
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
                <SearchInput
                    className={isMine ? 'lg:col-span-3' : 'lg:col-span-4'}
                    value={filters.search}
                    onChange={(value) => onChange('search', value)}
                />
                <StatusFilterPills
                    className="lg:col-span-3"
                    options={statusOptions}
                    value={filters.status}
                    onChange={(value) => onChange('status', value)}
                />
                <FilterSelect
                    className="lg:col-span-2"
                    label="Outcome"
                    value={filters.outcome}
                    options={outcomeOptions}
                    onChange={(value) => onChange('outcome', value)}
                />
                <FilterSelect
                    className={isMine ? 'lg:col-span-2' : 'lg:col-span-3'}
                    label="Confidence"
                    value={filters.confidenceSort}
                    options={confidenceSortOptions}
                    onChange={(value) => onChange('confidenceSort', value)}
                />
                {isMine && (
                    <FilterSelect
                        className="lg:col-span-2"
                        label="Points state"
                        value={filters.pointsState}
                        options={pointsStateOptions}
                        onChange={(value) => onChange('pointsState', value)}
                    />
                )}
            </div>
        </section>
    );
}
