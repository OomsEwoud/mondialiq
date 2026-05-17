import { ChevronDown } from 'lucide-react';

interface Props {
    expanded: boolean;
    onToggle: () => void;
}

export default function MatchDetailsToggle({ expanded, onToggle }: Props) {
    return (
        <div className="mt-3 text-center">
            <button
                type="button"
                onClick={onToggle}
                className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                aria-expanded={expanded}
            >
                {expanded ? 'Hide match details' : 'Match details'}
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>
        </div>
    );
}
