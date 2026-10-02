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
            className="flex flex-wrap gap-x-5 gap-y-1 sm:gap-x-7"
        >
            {statusTabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    aria-pressed={selected === tab.value}
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        'flex min-h-11 items-center border-b-2 px-0.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none',
                        selected === tab.value
                            ? 'border-[#6fae88] text-[#9ecbad]'
                            : 'border-transparent text-[#949d97] hover:text-white',
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
