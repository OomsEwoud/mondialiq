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
                        'h-9 rounded-full border px-4 text-sm font-black transition-colors',
                        selected === tab.value
                            ? 'border-cyan-300 bg-cyan-100 text-blue-950'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-blue-950',
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
