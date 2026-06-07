import { useState } from 'react';
import AiPredictionButton from '@/components/matches/prediction/ai-prediction-button';
import MatchDetailsActionButton from '@/components/matches/prediction/match-details-action-button';
import UserPredictionButton from '@/components/matches/prediction/user-prediction-button';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchPredictionActions({ match }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const openPredictionModal = () => setPredictionOpen(true);

    return (
        <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                        Match actions
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        Review the matchup, check AI availability and manage
                        your pick before kickoff.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <MatchDetailsActionButton matchId={match.id} />
                    <AiPredictionButton
                        available={Boolean(match.hasAiPrediction)}
                        matchId={match.id}
                    />
                    <UserPredictionButton
                        match={match}
                        onClick={openPredictionModal}
                    />
                </div>
            </div>

            <UserPredictionModal
                match={match}
                open={predictionOpen}
                onOpenChange={setPredictionOpen}
            />
        </div>
    );
}
