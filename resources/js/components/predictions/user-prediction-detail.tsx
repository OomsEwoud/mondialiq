import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import UserPredictedScoreCard from '@/components/predictions/user-predicted-score-card';
import UserPredictionActions from '@/components/predictions/user-prediction-actions';
import UserPredictionAiComparisonCard from '@/components/predictions/user-prediction-ai-comparison-card';
import UserPredictionHero from '@/components/predictions/user-prediction-hero';
import UserPredictionSummaryCards from '@/components/predictions/user-prediction-summary-cards';
import type { Match } from '@/types/match';
import {
    hasMatchStarted,
    predictionScoreLabel,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
}

export default function UserPredictionDetail({ match }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const hasUserPrediction = Boolean(match.userPrediction);
    const hasAiComparison = Boolean(match.hasAiPrediction);
    const score = predictionScoreLabel(match);
    const matchStarted = hasMatchStarted(match);
    const openPredictionModal = () => setPredictionOpen(true);

    return (
        <>
            <div className="space-y-4 sm:space-y-5">
                <UserPredictionHero match={match} />
                <UserPredictedScoreCard match={match} score={score} />
                <UserPredictionSummaryCards match={match} score={score} />

                {hasAiComparison ? (
                    <UserPredictionAiComparisonCard matchId={match.id} />
                ) : null}

                <UserPredictionActions
                    locked={matchStarted}
                    onEdit={openPredictionModal}
                />
            </div>

            {hasUserPrediction ? (
                <UserPredictionModal
                    match={match}
                    open={predictionOpen}
                    onOpenChange={setPredictionOpen}
                />
            ) : null}
        </>
    );
}
