import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import AiPredictionAdviceCard from '@/components/predictions/ai-prediction-advice-card';
import AiPredictionHero from '@/components/predictions/ai-prediction-hero';
import AiPredictionReportActions from '@/components/predictions/ai-prediction-report-actions';
import AiPredictionScoreCard from '@/components/predictions/ai-prediction-score-card';
import AiPredictionSummaryCards from '@/components/predictions/ai-prediction-summary-cards';
import AiProbabilityBreakdown from '@/components/predictions/ai-probability-breakdown';
import PredictionSourceComparison from '@/components/predictions/prediction-source-comparison';
import type { Match } from '@/types/match';
import type { AiPredictionContext } from '@/types/prediction';
import {
    aiPredictionScoreLabel,
    canMakePrediction,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
    aiContext: AiPredictionContext;
}

export default function AiPredictionReport({ match, aiContext }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const prediction = match.aiPrediction;
    const hasUserPrediction = Boolean(match.userPrediction);
    const predictionAllowed = canMakePrediction(match);
    const openPredictionModal = () => setPredictionOpen(true);
    const score = aiPredictionScoreLabel(match);

    return (
        <>
            <div className="space-y-4 sm:space-y-5">
                <AiPredictionHero match={match} />
                <AiPredictionScoreCard match={match} score={score} />
                <AiPredictionSummaryCards match={match} score={score} />
                <AiProbabilityBreakdown match={match} />

                <PredictionSourceComparison aiContext={aiContext} />

                <AiPredictionAdviceCard advice={prediction?.advice} />

                <AiPredictionReportActions
                    canMakePrediction={predictionAllowed}
                    hasUserPrediction={hasUserPrediction}
                    onPredictionClick={openPredictionModal}
                />

                <p className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 text-sm leading-6 font-medium text-slate-600 shadow-sm">
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
