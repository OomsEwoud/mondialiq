import { Link } from '@inertiajs/react';
import { ArrowRight, PencilLine, Sparkles } from 'lucide-react';
import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import { Button } from '@/components/ui/forms/button';
import { show as showMyPrediction } from '@/routes/predictions/mine';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    viewLabel: string;
}

export default function PredictionUserActions({ match, viewLabel }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const openPredictionModal = () => setPredictionOpen(true);

    return (
        <>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    className="justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-blue-950"
                    onClick={openPredictionModal}
                >
                    <PencilLine className="h-4 w-4" />
                    Edit prediction
                </Button>

                <Button
                    asChild
                    className="justify-center bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950"
                >
                    <Link href={showMyPrediction.url(match.id)}>
                        <Sparkles className="h-4 w-4" />
                        {viewLabel}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <UserPredictionModal
                match={match}
                open={predictionOpen}
                onOpenChange={setPredictionOpen}
            />
        </>
    );
}
