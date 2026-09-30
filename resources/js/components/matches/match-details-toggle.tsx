import { ChevronDown } from 'lucide-react';

interface Props {
    expanded: boolean;
    onToggle: () => void;
}

export default function MatchDetailsToggle({ expanded, onToggle }: Props) {
    return (
        <div className="mt-3 flex justify-end">
            <button
                type="button"
                onClick={onToggle}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#343d37] bg-[#0d110f] px-3 py-1.5 text-sm font-semibold text-[#a8b0ab] transition-colors hover:border-[#536159] hover:bg-[#171c19] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none data-[expanded=true]:border-[#4b775d] data-[expanded=true]:bg-[#17251d] data-[expanded=true]:text-[#8fd0a8]"
                aria-expanded={expanded}
                data-expanded={expanded}
            >
                Wedstrijddetails
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>
        </div>
    );
}
