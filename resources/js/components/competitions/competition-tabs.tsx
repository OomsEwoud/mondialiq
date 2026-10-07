import CompetitionController from '@/actions/App/Http/Controllers/Pages/CompetitionController';
import SportsTabs from '@/components/navigation/sports-tabs';
import type { CompetitionPageProps } from '@/types/competition';

const tabs: Array<{ id: CompetitionPageProps['tab']; label: string }> = [
    { id: 'overview', label: 'Overzicht' },
    { id: 'matches', label: 'Wedstrijden' },
    { id: 'standings', label: 'Stand' },
    { id: 'statistics', label: 'Statistieken' },
    { id: 'teams', label: 'Teams' },
];

export default function CompetitionTabs({
    competitionId,
    activeTab,
    availableTabs,
}: {
    competitionId: number;
    activeTab: CompetitionPageProps['tab'];
    availableTabs: CompetitionPageProps['tab'][];
}) {
    return (
        <SportsTabs
            mode="links"
            ariaLabel="Onderdelen van de competitie"
            activeValue={activeTab}
            items={tabs
                .filter((tab) => availableTabs.includes(tab.id))
                .map((tab) => ({
                    value: tab.id,
                    label: tab.label,
                    href: CompetitionController.url(competitionId, {
                        query: { tab: tab.id },
                    }),
                }))}
        />
    );
}
