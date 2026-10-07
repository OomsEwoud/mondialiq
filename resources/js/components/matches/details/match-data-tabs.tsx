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
        label: 'Verloop',
        icon: ListTree,
    },
    {
        value: 'stats',
        label: 'Statistieken',
        icon: BarChart3,
    },
    {
        value: 'lineups',
        label: 'Opstellingen',
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
        <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border px-2 sm:px-4">
                <div
                    role="tablist"
                    aria-label="Wedstrijdgegevens"
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
                                id={`match-tab-${tab.value}`}
                                aria-controls="match-data-panel"
                                aria-selected={isActive}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => setActiveTab(tab.value)}
                                onKeyDown={(event) => {
                                    const index = tabs.findIndex(
                                        ({ value }) => value === activeTab,
                                    );
                                    const nextIndex =
                                        event.key === 'ArrowRight'
                                            ? (index + 1) % tabs.length
                                            : event.key === 'ArrowLeft'
                                              ? (index + tabs.length - 1) %
                                                tabs.length
                                              : event.key === 'Home'
                                                ? 0
                                                : event.key === 'End'
                                                  ? tabs.length - 1
                                                  : null;

                                    if (nextIndex === null) {
                                        return;
                                    }

                                    event.preventDefault();
                                    setActiveTab(tabs[nextIndex].value);
                                    document
                                        .getElementById(
                                            `match-tab-${tabs[nextIndex].value}`,
                                        )
                                        ?.focus();
                                }}
                                className={cn(
                                    'flex min-h-12 min-w-0 items-center justify-center gap-1.5 border-b-2 px-1 text-xs font-semibold transition-colors focus-visible:outline-offset-[-4px] sm:gap-2 sm:px-3 sm:text-sm',
                                    isActive
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Icon
                                    className="hidden size-4 shrink-0 min-[380px]:block"
                                    aria-hidden="true"
                                />
                                <span className="truncate">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div
                id="match-data-panel"
                role="tabpanel"
                aria-labelledby={`match-tab-${activeTab}`}
                tabIndex={0}
                className="p-3 sm:p-5"
            >
                <MatchDataTabPanel activeTab={activeTab} match={match} />
            </div>
        </section>
    );
}
