import FilterDropdown from '@/components/filters/filter-dropdown';
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
        <FilterDropdown
            className={className}
            label={label}
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}
