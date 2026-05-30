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
            <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
                <p className="text-sm font-black text-blue-950">
                    Nothing to show yet.
                </p>
                <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
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
