import SportsTabs from '@/components/navigation/sports-tabs';
import { predictions } from '@/routes';

export type PredictionTab = 'ai' | 'mine' | 'user';

interface Props {
    activeTab: PredictionTab;
}

const tabs = [
    {
        value: 'ai',
        label: 'AI-analyse',
        sublabel: 'Kansen & context',
    },
    {
        value: 'mine',
        label: 'Mijn voorspellingen',
        sublabel: 'Jouw keuzes',
    },
] as const;

export default function PredictionTabs({ activeTab }: Props) {
    return (
        <SportsTabs
            mode="links"
            ariaLabel="Voorspellingen"
            activeValue={activeTab}
            items={tabs.map((tab) => ({
                ...tab,
                href: predictions.url({ query: { mode: tab.value } }),
            }))}
            className="mb-5 grid w-full grid-cols-2 gap-5 sm:gap-7"
        />
    );
}
