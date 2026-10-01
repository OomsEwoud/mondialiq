import { predictionFilterLabelClassName } from '@/components/predictions/filters/filter-field-label';
import { cn } from '@/lib/utils';
import type { PredictionFilterOption } from '@/types/prediction-filter';

interface Props<TValue extends string> {
    className?: string;
    label: string;
    value: TValue;
    options: PredictionFilterOption<TValue>[];
    onChange: (value: TValue) => void;
}

export default function FilterSelect<TValue extends string>({
    className,
    label,
    value,
    options,
    onChange,
}: Props<TValue>) {
    return (
        <label className={cn('grid gap-2', className)}>
            <span className={predictionFilterLabelClassName}>{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value as TValue)}
                className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-none transition-colors outline-none focus:border-ring focus:ring-2 focus:ring-ring"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
