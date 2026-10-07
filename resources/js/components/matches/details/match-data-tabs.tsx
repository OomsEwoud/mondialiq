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
    },
    {
        value: 'stats',
        label: 'Statistieken',
    },
    {
        value: 'lineups',
        label: 'Opstellingen',
    },
] satisfies {
    value: MatchDataTab;
    label: string;
}[];

export default function MatchDataTabs({ match }: Props) {
    const [activeTab, setActiveTab] = useState<MatchDataTab>('events');

    return (
        <section className="min-w-0 overflow-hidden">
            <div className="border-b border-border/70">
                <div
                    role="tablist"
                    aria-label="Wedstrijdgegevens"
                    className="grid grid-cols-3 gap-1"
                >
                    {tabs.map((tab) => {
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
                                    'flex min-h-14 min-w-0 items-center justify-center gap-1.5 border-b-2 px-1 text-xs font-medium transition-colors focus-visible:outline-offset-[-4px] sm:gap-2 sm:px-3 sm:text-sm',
                                    isActive
                                        ? 'border-primary font-semibold text-foreground'
                                        : 'border-transparent text-muted-foreground hover:text-foreground',
                                )}
                            >
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
                className="pt-5 sm:pt-7"
            >
                <MatchDataTabPanel activeTab={activeTab} match={match} />
            </div>
        </section>
    );
}
