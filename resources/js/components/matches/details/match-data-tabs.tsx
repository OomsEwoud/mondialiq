import { useState } from 'react';
import type { MatchDataTab } from '@/components/matches/details/match-data-tab-panel';
import MatchDataTabPanel from '@/components/matches/details/match-data-tab-panel';
import SportsTabs from '@/components/navigation/sports-tabs';
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
            <SportsTabs
                mode="tabs"
                ariaLabel="Wedstrijdgegevens"
                items={tabs}
                activeValue={activeTab}
                panelId="match-data-panel"
                onChange={setActiveTab}
            />
            <div
                id="match-data-panel"
                role="tabpanel"
                aria-labelledby={`sports-tab-${activeTab}`}
                tabIndex={0}
                className="pt-5 sm:pt-7"
            >
                <MatchDataTabPanel activeTab={activeTab} match={match} />
            </div>
        </section>
    );
}
