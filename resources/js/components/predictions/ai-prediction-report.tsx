import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import AiPredictionAdviceCard from '@/components/predictions/ai-prediction-advice-card';
import AiPredictionHero from '@/components/predictions/ai-prediction-hero';
import AiPredictionScoreCard from '@/components/predictions/ai-prediction-score-card';
import AiPredictionSummaryCards from '@/components/predictions/ai-prediction-summary-cards';
import AiProbabilityBreakdown from '@/components/predictions/ai-probability-breakdown';
import PredictionSourceComparison from '@/components/predictions/prediction-source-comparison';
import type { Match } from '@/types/match';
import type { AiPredictionContext } from '@/types/prediction';
import { aiPredictionScoreLabel } from '@/utils/match-prediction';

interface Props {
    match: Match;
    aiContext: AiPredictionContext;
}

export default function AiPredictionReport({ match, aiContext }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const prediction = match.aiPrediction;
    const hasUserPrediction = Boolean(match.userPrediction);
    const score = aiPredictionScoreLabel(match);

    return (
        <>
            <div className="space-y-5">
                <AiPredictionHero
                    match={match}
                    hasUserPrediction={hasUserPrediction}
                    onPredictionClick={() => setPredictionOpen(true)}
                />
                <AiPredictionSummaryCards match={match} score={score} />
                <AiPredictionScoreCard match={match} score={score} />
                <AiProbabilityBreakdown match={match} />
                <PredictionSourceComparison aiContext={aiContext} />
                <AiPredictionAdviceCard advice={prediction?.advice} />

                <p className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 text-center text-sm text-slate-500 shadow-sm">
                    Predictions are data-driven insights, not certainties.
                </p>
            </div>

            <UserPredictionModal
                match={match}
                open={predictionOpen}
                onOpenChange={setPredictionOpen}
            />
        </>
    );
}
