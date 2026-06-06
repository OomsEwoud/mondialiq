import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import PredictionScoreBreakdown from '@/components/predictions/prediction-score-breakdown';
import UserPredictedScoreCard from '@/components/predictions/user-predicted-score-card';
import UserPredictionActions from '@/components/predictions/user-prediction-actions';
import UserPredictionAiComparisonCard from '@/components/predictions/user-prediction-ai-comparison-card';
import UserPredictionHero from '@/components/predictions/user-prediction-hero';
import UserPredictionSummaryCards from '@/components/predictions/user-prediction-summary-cards';
import type { Match } from '@/types/match';
import type { UserPredictionScoringPreview } from '@/types/prediction';
import {
    hasMatchStarted,
    predictionScoreLabel,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
    scoringPreview: UserPredictionScoringPreview | null;
    scoringGuideHref: string;
}

export default function UserPredictionDetail({
    match,
    scoringPreview,
    scoringGuideHref,
}: Props) {
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
                <UserPredictedScoreCard
                    match={match}
                    score={score}
                    scoringPreview={scoringPreview}
                />
                <PredictionScoreBreakdown
                    predictedHomeScore={match.userPrediction?.homeScore ?? null}
                    predictedAwayScore={match.userPrediction?.awayScore ?? null}
                    actualHomeScore={match.score.fulltime.home}
                    actualAwayScore={match.score.fulltime.away}
                    pointsAwarded={match.userPrediction?.pointsAwarded ?? false}
                    awardedPoints={match.userPrediction?.points ?? null}
                    scoringPreview={scoringPreview}
                    homeTeamName={match.homeTeam}
                    awayTeamName={match.awayTeam}
                    scoringGuideHref={scoringGuideHref}
                />
                <UserPredictionSummaryCards
                    match={match}
                    score={score}
                    scoringPreview={scoringPreview}
                />

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
