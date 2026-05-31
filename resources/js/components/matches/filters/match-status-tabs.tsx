import { cn } from '@/lib/utils';
import type { MatchStatusFilter } from '@/types/match-page';

interface Props {
    selected: MatchStatusFilter;
    onChange: (value: MatchStatusFilter) => void;
}

const statusTabs: Array<{ label: string; value: MatchStatusFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Played', value: 'played' },
];

export default function MatchStatusTabs({ selected, onChange }: Props) {
    return (
        <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        'h-9 rounded-full border px-4 text-sm font-black transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                        selected === tab.value
                            ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
