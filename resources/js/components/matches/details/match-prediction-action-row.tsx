import { useState } from 'react';
import AiPredictionButton from '@/components/matches/prediction/ai-prediction-button';
import MatchDetailsActionButton from '@/components/matches/prediction/match-details-action-button';
import UserPredictionButton from '@/components/matches/prediction/user-prediction-button';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import type { Match } from '@/types/match';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
    scoreboardId?: number;
    boostsRemaining?: number | null;
    boostsLimit?: number | null;
}

export default function MatchPredictionActionRow({
    match,
    scoreboardId,
    boostsRemaining,
    boostsLimit,
}: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const hasAiPrediction = Boolean(match.hasAiPrediction);
    const modalMatch = toPredictionMatch(match);

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                        Match actions
                    </p>
                    <p className="mt-1 text-sm leading-6 font-medium text-slate-600">
                        Open the match report, check the AI signal and manage
                        your pick.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <MatchDetailsActionButton matchId={match.id} />
                    <AiPredictionButton
                        available={hasAiPrediction}
                        matchId={match.id}
                    />
                    <UserPredictionButton
                        match={modalMatch}
                        onClick={() => setPredictionOpen(true)}
                    />
                </div>
            </div>

            <UserPredictionModal
                match={modalMatch}
                open={predictionOpen}
                onOpenChange={setPredictionOpen}
                scoreboardId={scoreboardId}
                boostsRemaining={boostsRemaining}
                boostsLimit={boostsLimit}
            />
        </section>
    );
}

function toPredictionMatch(match: MatchDetails): Match {
    return {
        id: match.id,
        homeTeamId: match.homeTeam.id,
        homeTeam: match.homeTeam.name,
        homeTeamShort: match.homeTeam.code,
        homeTeamLogo: match.homeTeam.logo,
        awayTeamId: match.awayTeam.id,
        awayTeam: match.awayTeam.name,
        awayTeamShort: match.awayTeam.code,
        awayTeamLogo: match.awayTeam.logo,
        round: match.round,
        date: match.date,
        dateValue: match.dateValue,
        time: match.time,
        kickoffAt: match.kickoffAt,
        status: match.status,
        elapsedTime: match.elapsedTime,
        score: {
            fulltime: match.score.fulltime,
            extratime: match.score.extratime,
            penalties: match.score.penalties,
        },
        hasAiPrediction: match.hasAiPrediction,
        userPrediction: match.userPrediction,
    };
}
