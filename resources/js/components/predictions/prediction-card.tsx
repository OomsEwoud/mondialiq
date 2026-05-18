import PredictionMatchSummary from '@/components/predictions/prediction-match-summary';
import PredictionStatusAction from '@/components/predictions/prediction-status-action';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import UserPredictionSummary from '@/components/predictions/user-prediction-summary';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    actionLabel: string;
    mode: PredictionTab;
}

export default function PredictionCard({ match, actionLabel, mode }: Props) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid gap-3">
                    <PredictionMatchSummary match={match} />
                    {mode === 'mine' && (
                        <UserPredictionSummary match={match} />
                    )}
                </div>
                <PredictionStatusAction
                    matchId={match.id}
                    label={actionLabel}
                />
            </div>
        </div>
    );
}
