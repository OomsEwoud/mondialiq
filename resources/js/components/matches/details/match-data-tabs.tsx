import { BarChart3, ListTree, UsersRound } from 'lucide-react';
import { useState } from 'react';

import MatchEventsTimeline from '@/components/matches/details/match-events-timeline';
import MatchStatsPanel from '@/components/matches/details/match-stats-panel';
import { cn } from '@/lib/utils';
import type { MatchDetails } from '@/types/match-details';

type MatchDataTab = 'events' | 'stats' | 'lineups';

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
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 p-1">
                <div className="grid grid-cols-3 gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.value;

                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    'flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-black transition-colors focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none sm:gap-2 sm:px-3 sm:text-sm',
                                    isActive
                                        ? 'bg-blue-950 text-white shadow-sm'
                                        : 'text-slate-500 hover:bg-white hover:text-blue-950',
                                )}
                            >
                                <Icon className="size-4 shrink-0" />
                                <span className="truncate">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 sm:p-5">{renderTabPanel(activeTab, match)}</div>
        </section>
    );
}

function renderTabPanel(activeTab: MatchDataTab, match: MatchDetails) {
    if (activeTab === 'events') {
        return match.events.length > 0 ? (
            <MatchEventsTimeline events={match.events} />
        ) : (
            <MatchDataEmptyState message="No match events available yet." />
        );
    }

    if (activeTab === 'stats') {
        return match.stats.length > 0 ? (
            <MatchStatsPanel match={match} />
        ) : (
            <MatchDataEmptyState message="No match statistics available yet." />
        );
    }

    return (
        <MatchDataEmptyState message="No lineups available yet for this match." />
    );
}

function MatchDataEmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
            {message}
        </div>
    );
}
