import { cn } from '@/lib/utils';
import type { MatchStatusFilter } from '@/types/match-page';

type MatchStatusTabValue = MatchStatusFilter | 'today';

interface Props {
    selected: MatchStatusTabValue;
    onChange: (value: MatchStatusTabValue) => void;
}

const statusTabs: Array<{ label: string; value: MatchStatusTabValue }> = [
    { label: 'Alles', value: 'all' },
    { label: 'Vandaag', value: 'today' },
    { label: 'Live', value: 'live' },
    { label: 'Binnenkort', value: 'upcoming' },
    { label: 'Gespeeld', value: 'played' },
];

export default function MatchStatusTabs({ selected, onChange }: Props) {
    return (
        <div
            role="group"
            aria-label="Match status"
            className="grid grid-cols-3 gap-1 rounded-md bg-[#0b0e0d] p-1 sm:grid-cols-5"
        >
            {statusTabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    aria-pressed={selected === tab.value}
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        'flex h-9 min-w-0 items-center justify-center rounded-sm px-3 text-center text-sm leading-tight font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none',
                        selected === tab.value
                            ? 'bg-[#edf1ed] text-[#101412]'
                            : 'text-[#7f8882] hover:bg-[#171c19] hover:text-[#daddd9]',
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
