import { Head } from '@inertiajs/react';
import BackButton from '@/components/navigation/back-button';
import AiPredictionReport from '@/components/predictions/ai-prediction-report';
import UserPredictionDetail from '@/components/predictions/user-prediction-detail';
import { predictions } from '@/routes';
import type { PredictionShowPageProps as Props } from '@/types/prediction';

export default function PredictionShow({
    match,
    mode,
    aiContext,
    scoringGuideHref,
}: Props) {
    const isAiMode = mode === 'ai';
    const fallbackHref = predictions.url({
        query: { mode },
    });
    const pageTitle = `${match.homeTeam} vs ${match.awayTeam} Prediction`;

    return (
        <>
            <Head title={pageTitle} />

            <div className="mb-5">
                <BackButton fallbackHref={fallbackHref} />
            </div>

            {isAiMode ? (
                <AiPredictionReport match={match} aiContext={aiContext} />
            ) : (
                <UserPredictionDetail
                    match={match}
                    scoringGuideHref={scoringGuideHref}
                />
            )}
        </>
    );
}
