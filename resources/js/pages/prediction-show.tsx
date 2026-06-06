import BackButton from '@/components/navigation/back-button';
import AiPredictionReport from '@/components/predictions/ai-prediction-report';
import UserPredictionDetail from '@/components/predictions/user-prediction-detail';
import PageHead from '@/components/seo/page-head';
import { predictions } from '@/routes';
import type { PredictionShowPageProps as Props } from '@/types/prediction';

export default function PredictionShow({
    match,
    mode,
    aiContext,
    scoringPreview,
    scoringGuideHref,
}: Props) {
    const isAiMode = mode === 'ai';
    const fallbackHref = predictions.url({
        query: { mode },
    });
    const pageTitle = `${match.homeTeam} vs ${match.awayTeam} Prediction`;

    return (
        <>
            <PageHead
                title={pageTitle}
                description={`Read the MondialIQ prediction breakdown for ${match.homeTeam} vs ${match.awayTeam}, including AI context, likely score and your own pick.`}
            />

            <div className="mb-5">
                <BackButton fallbackHref={fallbackHref} />
            </div>

            {isAiMode ? (
                <AiPredictionReport match={match} aiContext={aiContext} />
            ) : (
                <UserPredictionDetail
                    match={match}
                    scoringPreview={scoringPreview}
                    scoringGuideHref={scoringGuideHref}
                />
            )}
        </>
    );
}
