import { Search } from 'lucide-react';
import { Input } from '@/components/ui/forms/input';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function SquadSearch({ value, onChange }: Props) {
    return (
        <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#858e88]" />
            <Input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Zoek een speler"
                className="h-10 rounded-lg border-[#343d37] bg-[#101512] pr-4 pl-10 text-sm font-medium text-[#daddd9] shadow-none placeholder:text-[#727c75] hover:border-[#536159] focus-visible:border-[#57ad78] focus-visible:ring-[#57ad78]/20"
            />
        </div>
    );
}
