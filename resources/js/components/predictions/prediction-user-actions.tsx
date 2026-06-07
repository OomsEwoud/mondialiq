import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
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
                    className="justify-center rounded-lg border-slate-200 bg-white px-5 font-semibold text-slate-700 shadow-none hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:ring-cyan-300"
                    onClick={openPredictionModal}
                >
                    Edit prediction
                </Button>

                <Button
                    asChild
                    className="justify-center rounded-lg bg-slate-900 px-5 font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:ring-cyan-300"
                >
                    <Link href={showMyPrediction.url(match.id)}>
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
