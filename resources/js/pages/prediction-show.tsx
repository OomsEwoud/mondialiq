import { Head } from '@inertiajs/react';
import BackButton from '@/components/navigation/back-button';
import PredictionDetailHero from '@/components/predictions/prediction-detail-hero';
import { predictions } from '@/routes';
import type { PredictionShowPageProps as Props } from '@/types/prediction';

export default function PredictionShow({ match, mode }: Props) {
    const fallbackHref = predictions.url({
        query: { mode },
    });

    return (
        <>
            <Head title={`${match.homeTeam} vs ${match.awayTeam} Prediction`} />

            <div className="mb-5">
                <BackButton fallbackHref={fallbackHref} />
            </div>

            <PredictionDetailHero match={match} mode={mode} />
        </>
    );
}
