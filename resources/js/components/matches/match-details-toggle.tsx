import { ChevronDown } from 'lucide-react';

interface Props {
    expanded: boolean;
    onToggle: () => void;
}

export default function MatchDetailsToggle({ expanded, onToggle }: Props) {
    return (
        <div className="mt-4 flex justify-end">
            <button
                type="button"
                onClick={onToggle}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none data-[expanded=true]:border-cyan-300 data-[expanded=true]:bg-cyan-50 data-[expanded=true]:text-cyan-700"
                aria-expanded={expanded}
                data-expanded={expanded}
            >
                Match details
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>
        </div>
    );
}
