import { CircleHelp } from 'lucide-react';

interface Props {
    onClick: () => void;
}

export default function StandingsExplanationTrigger({ onClick }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Open explanation of how standings work"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm transition-colors hover:border-border hover:bg-accent hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <CircleHelp className="size-4" />
            <span>How standings work</span>
        </button>
    );
}
