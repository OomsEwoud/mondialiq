import PredictionMatchSummary from '@/components/predictions/prediction-match-summary';
import PredictionStatusAction from '@/components/predictions/prediction-status-action';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function PredictionCard({ match }: Props) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PredictionMatchSummary match={match} />
                <PredictionStatusAction matchId={match.id} />
            </div>
        </div>
    );
}
