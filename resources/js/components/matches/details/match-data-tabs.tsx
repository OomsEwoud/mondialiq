import { BarChart3, ListTree, UsersRound } from 'lucide-react';
import { useState } from 'react';

import MatchDataTabPanel from '@/components/matches/details/match-data-tab-panel';
import { cn } from '@/lib/utils';
import type { MatchDataTab } from '@/components/matches/details/match-data-tab-panel';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

const tabs = [
    {
        value: 'events',
        label: 'Match events',
        icon: ListTree,
    },
    {
        value: 'stats',
        label: 'Match stats',
        icon: BarChart3,
    },
    {
        value: 'lineups',
        label: 'Lineups',
        icon: UsersRound,
    },
] satisfies {
    value: MatchDataTab;
    label: string;
    icon: typeof ListTree;
}[];

export default function MatchDataTabs({ match }: Props) {
    const [activeTab, setActiveTab] = useState<MatchDataTab>('events');

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-blue-950/5">
            <div className="border-b border-slate-200 bg-slate-50/80 p-1.5">
                <div
                    role="tablist"
                    aria-label="Match data"
                    className="grid grid-cols-3 gap-1"
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.value;

                        return (
                            <button
                                key={tab.value}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    'flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-black transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-2 sm:px-3 sm:text-sm',
                                    isActive
                                        ? 'bg-blue-950 text-white shadow-sm'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                )}
                            >
                                <Icon className="size-4 shrink-0" />
                                <span className="truncate">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div role="tabpanel" className="p-4 sm:p-5">
                <MatchDataTabPanel activeTab={activeTab} match={match} />
            </div>
        </section>
    );
}
