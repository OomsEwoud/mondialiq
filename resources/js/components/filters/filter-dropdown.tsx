import { useId } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/forms/select';
import { cn } from '@/lib/utils';

const emptyValue = '__empty_filter_value__';

interface Option<TValue extends string> {
    label: string;
    value: TValue;
}

interface Props<TValue extends string> {
    className?: string;
    disabled?: boolean;
    label: string;
    value: TValue;
    options: Option<TValue>[];
    onChange: (value: TValue) => void;
}

export default function FilterDropdown<TValue extends string>({
    className,
    disabled = false,
    label,
    value,
    options,
    onChange,
}: Props<TValue>) {
    const labelId = useId();

    return (
        <div className={cn('grid min-w-0 gap-2', className)}>
            <span
                id={labelId}
                className="text-xs font-bold text-muted-foreground"
            >
                {label}
            </span>
            <Select
                disabled={disabled}
                value={value === '' ? emptyValue : value}
                onValueChange={(nextValue) =>
                    onChange(
                        (nextValue === emptyValue ? '' : nextValue) as TValue,
                    )
                }
            >
                <SelectTrigger
                    aria-labelledby={labelId}
                    className="h-11 w-full rounded-md border-border-strong bg-surface px-3 text-sm font-semibold text-foreground hover:border-border-strong hover:bg-surface focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border-strong bg-surface-interactive text-foreground">
                    {options.map((option) => (
                        <SelectItem
                            key={option.value || emptyValue}
                            value={option.value || emptyValue}
                            className="cursor-pointer text-sm text-foreground focus:bg-muted focus:text-foreground data-[state=checked]:text-positive"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
