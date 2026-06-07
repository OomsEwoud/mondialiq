import { PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';

interface Props {
    canMakePrediction: boolean;
    hasUserPrediction: boolean;
    onPredictionClick: () => void;
}

export default function AiPredictionReportActions({
    canMakePrediction,
    hasUserPrediction,
    onPredictionClick,
}: Props) {
    if (!canMakePrediction) {
        return null;
    }

    const predictionActionLabel = hasUserPrediction
        ? 'Edit your prediction'
        : 'Make your prediction';

    return (
        <div className="flex justify-end">
            <Button
                type="button"
                className="bg-slate-900 text-white shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 sm:w-auto"
                onClick={onPredictionClick}
            >
                <PencilLine className="size-4" />
                {predictionActionLabel}
            </Button>
        </div>
    );
}
