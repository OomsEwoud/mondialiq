import EmptyPredictionsState from '@/components/predictions/empty-predictions-state';
import PredictionCard from '@/components/predictions/prediction-card';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import type { Match } from '@/types/match';

interface Props {
    matches: Match[];
    emptyMessage: string;
    actionLabel: string;
    mode: PredictionTab;
}

export default function PredictionList({
    matches,
    emptyMessage,
    actionLabel,
    mode,
}: Props) {
    if (matches.length === 0) {
        return <EmptyPredictionsState mode={mode} message={emptyMessage} />;
    }

    return (
        <div className="flex flex-col gap-3">
            {matches.map((match) => (
                <PredictionCard
                    key={match.id}
                    match={match}
                    actionLabel={actionLabel}
                    mode={mode}
                />
            ))}
        </div>
    );
}
