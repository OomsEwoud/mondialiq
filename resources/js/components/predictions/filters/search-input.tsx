import { Search } from 'lucide-react';
import { predictionFilterLabelClassName } from '@/components/predictions/filters/filter-field-label';
import { Input } from '@/components/ui/forms/input';
import { cn } from '@/lib/utils';

interface Props {
    className?: string;
    value: string;
    onChange: (value: string) => void;
}

export default function SearchInput({ className, value, onChange }: Props) {
    return (
        <label className={cn('grid gap-2', className)}>
            <span className={predictionFilterLabelClassName}>Search</span>
            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    aria-label="Search team or match"
                    placeholder="Search team or match"
                    className="h-11 w-full rounded-xl border-border bg-card pr-3 pl-10 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring"
                />
            </div>
        </label>
    );
}
