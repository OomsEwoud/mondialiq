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

    return (
        <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Match actions
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        Review the matchup, compare the model, then lock in your
                        pick.
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
                        onClick={() => setPredictionOpen(true)}
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
