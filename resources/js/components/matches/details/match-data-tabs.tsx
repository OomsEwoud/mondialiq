import { BarChart3, ListTree, UsersRound } from 'lucide-react';
import { useState } from 'react';
import type { MatchDataTab } from '@/components/matches/details/match-data-tab-panel';
import MatchDataTabPanel from '@/components/matches/details/match-data-tab-panel';
import { cn } from '@/lib/utils';
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
        <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 shadow-sm">
            <div className="border-b border-border bg-gradient-to-b from-card to-card p-1.5">
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
                                    'flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-2 sm:px-3 sm:text-sm',
                                    isActive
                                        ? 'bg-secondary text-white shadow-md'
                                        : 'bg-card/90 text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm',
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
