import PredictionMatchSummary from '@/components/predictions/prediction-match-summary';
import PredictionStatusAction from '@/components/predictions/prediction-status-action';
import type { PredictionMatch } from '@/types/prediction';

interface Props {
    match: PredictionMatch;
}

export default function PredictionCard({ match }: Props) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PredictionMatchSummary match={match} />
                <PredictionStatusAction available={match.available} />
            </div>
        </div>
    );
}
