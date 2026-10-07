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
        <div className="mt-4 border-t border-border-subtle pt-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-bold text-primary uppercase">
                        Wat wil je doen?
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Bekijk de analyse of leg je eigen voorspelling vast.
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
