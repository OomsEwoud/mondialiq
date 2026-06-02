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
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm shadow-cyan-950/5 transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <CircleHelp className="size-4" />
            <span>How standings work</span>
        </button>
    );
}
