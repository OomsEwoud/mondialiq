import { Link } from '@inertiajs/react';
import { LineChart, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show as showMatch } from '@/routes/matches';

interface Props {
    hasUserPrediction: boolean;
    matchId: number;
    onPredictionClick: () => void;
}

export default function AiPredictionReportActions({
    hasUserPrediction,
    matchId,
    onPredictionClick,
}: Props) {
    return (
        <section className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
                asChild
                variant="outline"
                className="justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-blue-950"
            >
                <Link href={showMatch.url(matchId)}>
                    <LineChart className="size-4" />
                    View match details
                </Link>
            </Button>

            <Button
                type="button"
                className="justify-center bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950"
                onClick={onPredictionClick}
            >
                <PencilLine className="size-4" />
                {hasUserPrediction
                    ? 'Edit your prediction'
                    : 'Make your prediction'}
            </Button>
        </section>
    );
}
