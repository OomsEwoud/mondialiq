import { useMemo, useState } from 'react';
import Pagination from '@/components/navigation/pagination';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionPageHeader from '@/components/predictions/prediction-page-header';
import PredictionTabs from '@/components/predictions/prediction-tabs';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import type { PredictionPageProps as Props } from '@/types/prediction';

export default function Predictions({ fixtures }: Props) {
    const [activeTab, setActiveTab] = useState<PredictionTab>('ai');
    const visibleMatches = useMemo(
        () =>
            activeTab === 'mine'
                ? fixtures.data.filter((match) => match.prediction)
                : fixtures.data,
        [activeTab, fixtures.data],
    );

    return (
        <>
            <PredictionPageHeader />
            <PredictionTabs activeTab={activeTab} onChange={setActiveTab} />
            <PredictionList
                matches={visibleMatches}
                emptyMessage={
                    activeTab === 'mine'
                        ? 'You do not have any AI predictions yet.'
                        : 'No AI predictions found.'
                }
            />
            {activeTab === 'ai' && <Pagination links={fixtures.links} />}
        </>
    );
}
