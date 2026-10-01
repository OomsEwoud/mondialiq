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
                role="group"
                aria-label="Match status"
                className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-1.5 shadow-sm sm:grid-cols-4"
            >
                {matchStatusOptions.map((option) => {
                    const selected = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                'flex h-10 min-w-0 items-center justify-center rounded-xl px-3 text-center text-sm leading-tight font-bold transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                selected
                                    ? 'bg-secondary text-white shadow-md'
                                    : 'text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm',
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
