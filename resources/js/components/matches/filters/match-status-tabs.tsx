import { cn } from '@/lib/utils';
import type { MatchStatusFilter } from '@/types/match-page';

type MatchStatusTabValue = MatchStatusFilter | 'today';

interface Props {
    selected: MatchStatusTabValue;
    onChange: (value: MatchStatusTabValue) => void;
}

const statusTabs: Array<{ label: string; value: MatchStatusTabValue }> = [
    { label: 'All matches', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Live now', value: 'live' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Finished', value: 'played' },
];

export default function MatchStatusTabs({ selected, onChange }: Props) {
    return (
        <div
            role="radiogroup"
            aria-label="Match status"
            className="grid grid-cols-2 gap-1 rounded-[1.35rem] border border-white/80 bg-white/70 p-1 shadow-sm shadow-cyan-950/5 sm:grid-cols-5"
        >
            {statusTabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    role="radio"
                    aria-checked={selected === tab.value}
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        'flex h-10 min-w-0 items-center justify-center rounded-[1rem] px-3 text-center text-sm leading-tight font-black transition-all focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                        selected === tab.value
                            ? 'bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.9))] text-cyan-800 shadow-sm ring-1 ring-cyan-300'
                            : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
