import { predictionFilterLabelClassName } from '@/components/predictions/filters/filter-field-label';
import { cn } from '@/lib/utils';
import type { PredictionStatusFilter } from '@/types/prediction-filter';

type MatchStatusSegmentValue = PredictionStatusFilter | 'today';

interface MatchStatusOption {
    label: string;
    value: MatchStatusSegmentValue;
}

interface Props {
    className?: string;
    value: MatchStatusSegmentValue;
    onChange: (value: MatchStatusSegmentValue) => void;
}

const matchStatusOptions: MatchStatusOption[] = [
    { label: 'All matches', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Upcoming matches', value: 'upcoming' },
    { label: 'Finished matches', value: 'past' },
];

export default function MatchStatusSegmentedFilter({
    className,
    value,
    onChange,
}: Props) {
    return (
        <div className={cn('grid gap-2', className)}>
            <p className={predictionFilterLabelClassName}>Match status</p>
            <div
                role="radiogroup"
                aria-label="Match status"
                className="grid grid-cols-2 gap-1 rounded-[1.35rem] border border-slate-200 bg-white p-1 shadow-sm shadow-cyan-950/5 sm:grid-cols-4"
            >
                {matchStatusOptions.map((option) => {
                    const selected = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                'flex h-10 min-w-0 items-center justify-center rounded-[1rem] px-3 text-center text-sm leading-tight font-black transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                                selected
                                    ? 'bg-cyan-50 text-cyan-800 shadow-sm ring-1 ring-cyan-200'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
