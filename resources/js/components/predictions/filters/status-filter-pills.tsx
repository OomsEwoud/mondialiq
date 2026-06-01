import { predictionFilterLabelClassName } from '@/components/predictions/filters/filter-field-label';
import { cn } from '@/lib/utils';
import type {
    PredictionFilterOption,
    PredictionStatusFilter,
} from '@/types/prediction-filter';

interface Props {
    className?: string;
    options: PredictionFilterOption<PredictionStatusFilter>[];
    value: PredictionStatusFilter;
    onChange: (value: PredictionStatusFilter) => void;
}

export default function StatusFilterPills({
    className,
    options,
    value,
    onChange,
}: Props) {
    return (
        <div className={cn('grid gap-2', className)}>
            <p className={predictionFilterLabelClassName}>Status</p>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={value === option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'h-11 rounded-full border px-3 text-sm font-black whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                            value === option.value
                                ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
