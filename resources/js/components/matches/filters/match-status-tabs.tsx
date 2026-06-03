import { cn } from '@/lib/utils';
import type { MatchStatusFilter } from '@/types/match-page';

interface Props {
    selected: MatchStatusFilter;
    onChange: (value: MatchStatusFilter) => void;
}

const statusTabs: Array<{ label: string; value: MatchStatusFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Live', value: 'live' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Played', value: 'played' },
];

export default function MatchStatusTabs({ selected, onChange }: Props) {
    return (
        <div className="flex flex-wrap gap-2.5">
            {statusTabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        'h-10 rounded-full border px-4 text-sm font-black shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                        selected === tab.value
                            ? 'border-cyan-300 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.9))] text-cyan-800 shadow-cyan-950/10'
                            : 'border-white/90 bg-white/80 text-slate-600 shadow-cyan-950/5 hover:border-cyan-200 hover:bg-cyan-50/70 hover:text-slate-900',
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
