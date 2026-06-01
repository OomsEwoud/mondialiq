import { useState } from 'react';
import AiPredictionButton from '@/components/matches/prediction/ai-prediction-button';
import MatchDetailsActionButton from '@/components/matches/prediction/match-details-action-button';
import UserPredictionButton from '@/components/matches/prediction/user-prediction-button';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import type { Match } from '@/types/match';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchPredictionActionRow({ match }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const hasAiPrediction = Boolean(match.hasAiPrediction);
    const modalMatch = toPredictionMatch(match);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-blue-950/5 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-black tracking-widest text-cyan-600 uppercase">
                        Match actions
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                        Open the match report, check the AI signal and manage
                        your pick.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
