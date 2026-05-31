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
                className="inline-flex min-h-9 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-black text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none data-[expanded=true]:border-cyan-200 data-[expanded=true]:bg-cyan-50 data-[expanded=true]:text-cyan-700"
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
