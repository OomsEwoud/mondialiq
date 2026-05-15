import { useMemo, useState } from 'react';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionPageHeader from '@/components/predictions/prediction-page-header';
import PredictionTabs from '@/components/predictions/prediction-tabs';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import type { PredictionMatch } from '@/types/prediction';

const matches: PredictionMatch[] = [
    {
        id: 1,
        homeCode: 'USA',
        awayCode: 'MEX',
        round: 'Group Stage - Matchday 1',
        date: 'Jun 12',
        time: '15:00',
        available: false,
    },
    {
        id: 2,
        homeCode: 'CAN',
        awayCode: 'URU',
        round: 'Group Stage - Matchday 1',
        date: 'Jun 12',
        time: '18:00',
        available: true,
    },
    {
        id: 3,
        homeCode: 'BRA',
        awayCode: 'ARG',
        round: 'Group Stage - Matchday 2',
        date: 'Jun 13',
        time: '21:00',
        available: false,
    },
    {
        id: 4,
        homeCode: 'NED',
        awayCode: 'FRA',
        round: 'Group Stage - Matchday 2',
        date: 'Jun 14',
        time: '20:00',
        available: true,
    },
];

export default function Predictions() {
    const [activeTab, setActiveTab] = useState<PredictionTab>('ai');
    const visibleMatches = useMemo(
        () =>
            activeTab === 'mine'
                ? matches.filter((match) => match.available)
                : matches,
        [activeTab],
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
        </>
    );
}
