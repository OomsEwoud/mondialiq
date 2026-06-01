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
                <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    aria-label="Search team or match"
                    placeholder="Search team or match"
                    className="h-11 w-full rounded-xl border-slate-200 bg-white pr-3 pl-10 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-cyan-300 focus-visible:ring-cyan-200"
                />
            </div>
        </label>
    );
}
