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
        return (
            <div className="py-12 text-center text-sm text-slate-400">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
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
