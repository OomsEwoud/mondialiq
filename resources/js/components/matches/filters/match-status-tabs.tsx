import { cn } from '@/lib/utils';
import type { MatchStatusFilter } from '@/types/match-page';

export type MatchStatusTabValue = MatchStatusFilter | 'today' | 'tomorrow';

interface Props {
    selected: MatchStatusTabValue | null;
    onChange: (value: MatchStatusTabValue) => void;
}

const statusTabs: Array<{ label: string; value: MatchStatusTabValue }> = [
    { label: 'Alles', value: 'all' },
    { label: 'Vandaag', value: 'today' },
    { label: 'Morgen', value: 'tomorrow' },
    { label: 'Live', value: 'live' },
    { label: 'Binnenkort', value: 'upcoming' },
    { label: 'Gespeeld', value: 'played' },
];

export default function MatchStatusTabs({ selected, onChange }: Props) {
    return (
        <div
            role="group"
            aria-label="Datum en wedstrijdstatus"
            className="grid grid-cols-3 gap-1 sm:grid-cols-6"
        >
            {statusTabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    aria-pressed={selected === tab.value}
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        'flex min-h-10 items-center justify-center rounded-md border-b-2 px-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none',
                        selected === tab.value
                            ? 'border-[#6fae88] bg-[#202822] text-[#f3f4f1]'
                            : 'border-transparent text-[#949d97] hover:text-white',
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
