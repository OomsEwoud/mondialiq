import { Head } from '@inertiajs/react';
import Pagination from '@/components/navigation/pagination';
import PredictionInfoGrid from '@/components/predictions/prediction-info-grid';
import PredictionList from '@/components/predictions/prediction-list';
import PredictionPageHeader from '@/components/predictions/prediction-page-header';
import PredictionTabs from '@/components/predictions/prediction-tabs';
import type { PredictionPageProps as Props } from '@/types/prediction';

export default function Predictions({ fixtures, mode }: Props) {
    return (
        <>
            <Head title="Predictions" />

            <PredictionPageHeader />
            <PredictionInfoGrid />
            <PredictionTabs activeTab={mode} />
            <PredictionList
                matches={fixtures.data}
                mode={mode}
                emptyMessage={
                    mode === 'mine'
                        ? 'You have not predicted any matches yet.'
                        : 'No AI predictions available yet.'
                }
                actionLabel={
                    mode === 'mine' ? 'View prediction' : 'View insights'
                }
            />
            <Pagination links={fixtures.links} />
        </>
    );
}
