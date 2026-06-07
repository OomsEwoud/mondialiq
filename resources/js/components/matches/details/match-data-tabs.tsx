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
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 shadow-sm">
            <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white p-1.5">
                <div
                    role="tablist"
                    aria-label="Match data"
                    className="grid grid-cols-3 gap-1.5"
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
                                    'flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-2xl px-2 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-2 sm:px-3 sm:text-sm',
                                    isActive
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-white/90 text-slate-600 hover:bg-white hover:text-slate-900',
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
