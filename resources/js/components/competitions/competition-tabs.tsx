import { Link } from '@inertiajs/react';
import CompetitionController from '@/actions/App/Http/Controllers/Pages/CompetitionController';
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
        <nav
            aria-label="Onderdelen van de competitie"
            className="-mx-4 mb-9 flex gap-1 overflow-x-auto border-b border-[#343b37] px-4 sm:mx-0 sm:px-0"
        >
            {tabs
                .filter((tab) => availableTabs.includes(tab.id))
                .map((tab) => (
                    <Link
                        key={tab.id}
                        href={CompetitionController.url(competitionId, {
                            query: { tab: tab.id },
                        })}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                        className={`min-h-12 shrink-0 border-b-2 px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none ${activeTab === tab.id ? 'border-[#6fae88] text-white' : 'border-transparent text-[#949d97] hover:text-white'}`}
                    >
                        {tab.label}
                    </Link>
                ))}
        </nav>
    );
}
