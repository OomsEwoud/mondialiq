import { Head } from '@inertiajs/react';
import BackButton from '@/components/navigation/back-button';
import PredictionDetailHero from '@/components/predictions/prediction-detail-hero';
import { predictions } from '@/routes';
import type { PredictionShowPageProps as Props } from '@/types/prediction';

export default function PredictionShow({ match }: Props) {
    return (
        <>
            <Head title={`${match.homeTeam} vs ${match.awayTeam} Prediction`} />

            <div className="mb-5">
                <BackButton fallbackHref={predictions.url({ query: { mode: 'mine' } })} />
            </div>

            <PredictionDetailHero match={match} />
        </>
    );
}
