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
    label: string;
    value: TValue;
    options: Option<TValue>[];
    onChange: (value: TValue) => void;
}

export default function FilterDropdown<TValue extends string>({
    className,
    label,
    value,
    options,
    onChange,
}: Props<TValue>) {
    const labelId = useId();

    return (
        <div className={cn('grid min-w-0 gap-2', className)}>
            <span id={labelId} className="text-xs font-bold text-[#89928c]">
                {label}
            </span>
            <Select
                value={value === '' ? emptyValue : value}
                onValueChange={(nextValue) =>
                    onChange(
                        (nextValue === emptyValue ? '' : nextValue) as TValue,
                    )
                }
            >
                <SelectTrigger
                    aria-labelledby={labelId}
                    className="h-11 w-full rounded-md border-[#343d37] bg-[#0d110f] px-3 text-sm font-semibold text-[#daddd9] hover:border-[#536159] hover:bg-[#0d110f] focus-visible:border-[#57ad78] focus-visible:ring-2 focus-visible:ring-[#57ad78]/20"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#343d37] bg-[#141916] text-[#daddd9]">
                    {options.map((option) => (
                        <SelectItem
                            key={option.value || emptyValue}
                            value={option.value || emptyValue}
                            className="cursor-pointer text-sm text-[#daddd9] focus:bg-[#1b211e] focus:text-white data-[state=checked]:text-[#9ecbad]"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
