import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import PredictionScoreBreakdown from '@/components/predictions/prediction-score-breakdown';
import UserPredictedScoreCard from '@/components/predictions/user-predicted-score-card';
import UserPredictionAiComparisonCard from '@/components/predictions/user-prediction-ai-comparison-card';
import UserPredictionHero from '@/components/predictions/user-prediction-hero';
import UserPredictionSummaryCards from '@/components/predictions/user-prediction-summary-cards';
import type { Match } from '@/types/match';
import type { PredictionOwner, UserPredictionScoringPreview } from '@/types/prediction';
import { predictionScoreLabel } from '@/utils/match-prediction';

interface Props {
    match: Match;
    scoringPreview: UserPredictionScoringPreview | null;
    scoringGuideHref: string;
    owner: PredictionOwner;
}

export default function UserPredictionDetail({
    match,
    scoringPreview,
    scoringGuideHref,
    owner,
}: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const hasAiComparison = Boolean(match.hasAiPrediction);
    const score = predictionScoreLabel(match);

    return (
        <>
            <div className="space-y-5">
                <UserPredictionHero
                    match={match}
                    owner={owner}
                    onEdit={() => setPredictionOpen(true)}
                />
                <UserPredictedScoreCard
                    match={match}
                    score={score}
                    scoringPreview={scoringPreview}
                    owner={owner}
                />
                <UserPredictionSummaryCards
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
                    owner={owner}
                />

                {hasAiComparison && (
                    <UserPredictionAiComparisonCard matchId={match.id} />
                )}
            </div>

            {owner.canEdit && match.userPrediction && (
                <UserPredictionModal
                    match={match}
                    open={predictionOpen}
                    onOpenChange={setPredictionOpen}
                />
            )}
        </>
    );
}
