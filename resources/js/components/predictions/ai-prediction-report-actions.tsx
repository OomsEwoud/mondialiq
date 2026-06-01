import { Link } from '@inertiajs/react';
import { ArrowLeft, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { predictions } from '@/routes';

interface Props {
    hasUserPrediction: boolean;
    onPredictionClick: () => void;
}

export default function AiPredictionReportActions({
    hasUserPrediction,
    onPredictionClick,
}: Props) {
    const predictionActionLabel = hasUserPrediction
        ? 'Edit your prediction'
        : 'Make your prediction';
    const predictionsHref = predictions.url({
        query: { mode: 'ai' },
    });

    return (
        <section className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
                asChild
                variant="outline"
                className="w-full justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-blue-950 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 sm:w-auto"
            >
                <Link href={predictionsHref}>
                    <ArrowLeft className="size-4" />
                    Back to matches
                </Link>
            </Button>

            <Button
                type="button"
                className="w-full justify-center bg-blue-950 text-white hover:bg-blue-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 sm:w-auto"
                onClick={onPredictionClick}
            >
                <PencilLine className="size-4" />
                {predictionActionLabel}
            </Button>
        </section>
    );
}
