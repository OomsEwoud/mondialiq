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
                className="inline-flex min-h-9 items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-black text-blue-700 transition-colors hover:bg-cyan-100 hover:text-blue-950 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                aria-expanded={expanded}
            >
                Match details
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>
        </div>
    );
}
