import Pagination from '@/components/navigation/pagination';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionPageHeader from '@/components/predictions/prediction-page-header';
import PredictionTabs from '@/components/predictions/prediction-tabs';
import type { PredictionPageProps as Props } from '@/types/prediction';

export default function Predictions({ fixtures, mode }: Props) {
    return (
        <>
            <PredictionPageHeader />
            <PredictionTabs activeTab={mode} />
            <PredictionList
                matches={fixtures.data}
                emptyMessage={
                    mode === 'mine'
                        ? 'You do not have any AI predictions yet.'
                        : 'No AI predictions available yet.'
                }
            />
            <Pagination links={fixtures.links} />
        </>
    );
}
