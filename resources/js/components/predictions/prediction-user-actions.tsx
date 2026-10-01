import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import { Button } from '@/components/ui/forms/button';
import { show as showMyPrediction } from '@/routes/predictions/mine';
import type { Match } from '@/types/match';
import { isPredictionLocked } from '@/utils/match-prediction';

interface Props {
    match: Match;
    viewLabel: string;
    scoreboardId?: number;
    boostsRemaining?: number | null;
    boostsLimit?: number | null;
    boostedConfidenceThreshold?: string | null;
}

export default function PredictionUserActions({
    match,
    viewLabel,
    scoreboardId,
    boostsRemaining,
    boostsLimit,
    boostedConfidenceThreshold,
}: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const locked = isPredictionLocked(match);
    const openPredictionModal = () => setPredictionOpen(true);

    return (
        <>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    disabled={locked}
                    className="justify-center rounded-lg border-border bg-card px-5 font-semibold text-foreground shadow-none hover:border-border hover:bg-accent hover:text-primary focus-visible:ring-ring"
                    onClick={openPredictionModal}
                >
                    {locked ? 'Prediction locked' : 'Edit prediction'}
                </Button>

                <Button
                    asChild
                    className="justify-center rounded-lg bg-secondary px-5 font-semibold text-white shadow-sm hover:bg-muted focus-visible:ring-ring"
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
                scoreboardId={scoreboardId}
                boostsRemaining={boostsRemaining}
                boostsLimit={boostsLimit}
                boostedConfidenceThreshold={boostedConfidenceThreshold}
            />
        </>
    );
}
