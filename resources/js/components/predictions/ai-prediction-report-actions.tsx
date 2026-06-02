import { Link } from '@inertiajs/react';
import { ArrowLeft, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { matches } from '@/routes';

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
    const predictionActionLabel = hasUserPrediction
        ? 'Edit your prediction'
        : 'Make your prediction';

    return (
        <section className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button
                asChild
                variant="outline"
                className="w-full justify-center border-slate-200 bg-white text-slate-700 shadow-sm shadow-cyan-950/5 hover:bg-slate-100 hover:text-blue-950 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 sm:w-auto"
            >
                <Link href={matches.url()}>
                    <ArrowLeft className="size-4" />
                    Back to matches
                </Link>
            </Button>

            {canMakePrediction ? (
                <Button
                    type="button"
                    className="w-full justify-center bg-[linear-gradient(135deg,#16255f_0%,#21326e_100%)] text-white shadow-lg shadow-blue-950/20 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 sm:w-auto"
                    onClick={onPredictionClick}
                >
                    <PencilLine className="size-4" />
                    {predictionActionLabel}
                </Button>
            ) : null}
        </section>
    );
}
