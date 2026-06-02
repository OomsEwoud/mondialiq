import { Search } from 'lucide-react';
import { Input } from '@/components/ui/forms/input';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function SquadSearch({ value, onChange }: Props) {
    return (
        <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cyan-600" />
            <Input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search players"
                className="h-12 rounded-2xl border-slate-200 bg-white pr-4 pl-11 text-sm font-semibold shadow-sm shadow-cyan-950/5 focus-visible:border-cyan-300 focus-visible:ring-cyan-200"
            />
        </div>
    );
}
