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
            className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-1.5 shadow-sm sm:grid-cols-5"
        >
            {statusTabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    role="radio"
                    aria-checked={selected === tab.value}
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        'flex h-10 min-w-0 items-center justify-center rounded-xl px-3 text-center text-sm leading-tight font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                        selected === tab.value
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm',
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
