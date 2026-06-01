import { Search } from 'lucide-react';
import { Input } from '@/components/ui/forms/input';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function SquadSearch({ value, onChange }: Props) {
    return (
        <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-cyan-600" />
            <Input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search players"
                className="h-11 rounded-xl border-slate-200 bg-white pr-3 pl-9 text-sm font-semibold shadow-none focus-visible:border-cyan-300 focus-visible:ring-cyan-200"
            />
        </div>
    );
}
