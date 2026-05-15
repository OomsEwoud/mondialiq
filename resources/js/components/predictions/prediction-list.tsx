import PredictionCard from '@/components/predictions/prediction-card';
import type { PredictionMatch } from '@/types/prediction';

interface Props {
    matches: PredictionMatch[];
    emptyMessage: string;
}

export default function PredictionList({ matches, emptyMessage }: Props) {
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
                <PredictionCard key={match.id} match={match} />
            ))}
        </div>
    );
}
