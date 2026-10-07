import BackButton from '@/components/navigation/back-button';
import AiPredictionReport from '@/components/predictions/ai-prediction-report';
import UserPredictionDetail from '@/components/predictions/user-prediction-detail';
import PageHead from '@/components/seo/page-head';
import type { PredictionShowPageProps as Props } from '@/types/prediction';

export default function PredictionShow({
    match,
    mode,
    aiContext,
    scoringPreview,
    scoringGuideHref,
    owner,
    backHref,
}: Props) {
    const isAiMode = mode === 'ai';
    const pageTitle = `${match.homeTeam} vs ${match.awayTeam} ${isAiMode ? 'AI-analyse' : 'Prediction'}`;

    return (
        <>
            <PageHead
                title={pageTitle}
                description={
                    isAiMode
                        ? `Bekijk de AI-voorspelling, verwachte uitkomst en onderbouwing voor ${match.homeTeam} tegen ${match.awayTeam}.`
                        : `Read the MondialIQ prediction breakdown for ${match.homeTeam} vs ${match.awayTeam}, including AI context, likely score and insights.`
                }
            />

            <div className="mb-5">
                <BackButton
                    fallbackHref={backHref}
                    className={
                        isAiMode
                            ? 'border-transparent bg-transparent px-0 hover:border-transparent hover:bg-transparent [&>span]:bg-transparent'
                            : undefined
                    }
                />
            </div>

            {isAiMode ? (
                <AiPredictionReport match={match} aiContext={aiContext} />
            ) : (
                <UserPredictionDetail
                    match={match}
                    scoringPreview={scoringPreview}
                    scoringGuideHref={scoringGuideHref}
                    owner={owner}
                />
            )}
        </>
    );
}
