import { usePage } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import UserPredictionForm from '@/components/matches/prediction/user-prediction-form';
import UserPredictionLoginPrompt from '@/components/matches/prediction/user-prediction-login-prompt';
import UserPredictionMatchSummary from '@/components/matches/prediction/user-prediction-match-summary';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/overlays/dialog';
import type { Auth } from '@/types/auth';
import type { Match } from '@/types/match';
import {
    isPredictionLocked,
    predictionScoreLabel,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UserPredictionModal({
    match,
    open,
    onOpenChange,
}: Props) {
    const auth = usePage<{ auth: Auth }>().props.auth;
    const isEditing = Boolean(match.userPrediction);
    const predictionLocked = isPredictionLocked(match);
    const currentPredictionLabel = match.userPrediction?.label;
    const currentScoreLabel = predictionScoreLabel(match);
    const currentConfidence = match.userPrediction?.confidence;
    const closeModal = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] min-h-0 flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-sm sm:max-w-3xl">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
                    <DialogHeader className="gap-3 pr-8 text-left">
                        <span className="w-fit rounded-full border border-slate-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            Personal pick
                        </span>
                        <div className="grid gap-2">
                            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                                {predictionLocked && isEditing
                                    ? 'View your prediction'
                                    : isEditing
                                      ? 'Edit your prediction'
                                      : 'Make your prediction'}
                            </DialogTitle>
                            <DialogDescription className="text-sm leading-6 text-slate-600">
                                {predictionLocked
                                    ? 'Predictions are locked once the match has started.'
                                    : 'Choose a winner, predict the score and set your confidence before kickoff.'}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="mt-5 grid gap-4">
                        <UserPredictionMatchSummary match={match} />

                        {predictionLocked && (
                            <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
                                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>
                                    Predictions are closed because this match
                                    has already started.
                                </p>
                            </div>
                        )}

                        <div className="rounded-2xl border border-slate-200 bg-cyan-50/60 p-3 text-sm text-slate-600">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-slate-900">
                                    Current pick:
                                </span>
                                <span>
                                    {currentPredictionLabel ??
                                        'No pick selected yet'}
                                </span>
                                {currentScoreLabel && (
                                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                        Score: {currentScoreLabel}
                                    </span>
                                )}
                                {currentConfidence && (
                                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 capitalize">
                                        Confidence: {currentConfidence}
                                    </span>
                                )}
                            </div>
                        </div>

                        {!auth.user ? (
                            <UserPredictionLoginPrompt />
                        ) : (
                            <UserPredictionForm
                                match={match}
                                open={open}
                                onSaved={closeModal}
                                onCancel={closeModal}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
