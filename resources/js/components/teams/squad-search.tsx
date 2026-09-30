import { Search } from 'lucide-react';
import { Input } from '@/components/ui/forms/input';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function SquadSearch({ value, onChange }: Props) {
    return (
        <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#70b98e]" />
            <Input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Zoek een speler"
                className="h-11 rounded-md border-[#343d37] bg-[#0d110f] pr-4 pl-10 text-sm font-semibold text-[#daddd9] shadow-none placeholder:text-[#59615c] hover:border-[#536159] focus-visible:border-[#57ad78] focus-visible:ring-[#57ad78]/20"
            />
        </div>
    );
}
