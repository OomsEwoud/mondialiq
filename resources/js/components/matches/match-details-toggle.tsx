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
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm font-semibold text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-interactive hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[expanded=true]:border-border-strong data-[expanded=true]:bg-brand-subtle data-[expanded=true]:text-positive"
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
