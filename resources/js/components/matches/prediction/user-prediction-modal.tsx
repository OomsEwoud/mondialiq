import { usePage } from '@inertiajs/react';
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
import { predictionScoreLabel } from '@/utils/match-prediction';

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
    const currentPredictionLabel = match.userPrediction?.label;
    const currentScoreLabel = predictionScoreLabel(match);
    const currentConfidence = match.userPrediction?.confidence;
    const closeModal = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] min-h-0 flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl shadow-blue-950/20 sm:max-w-3xl">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
                    <DialogHeader className="gap-3 pr-8 text-left">
                        <span className="w-fit rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black tracking-wide text-cyan-700 uppercase">
                            Personal pick
                        </span>
                        <div className="grid gap-2">
                            <DialogTitle className="text-2xl font-black tracking-tight text-blue-950">
                                {isEditing
                                    ? 'Edit your prediction'
                                    : 'Make your prediction'}
                            </DialogTitle>
                            <DialogDescription className="text-sm leading-6 text-slate-600">
                                Choose a winner, predict the score and set your
                                confidence before kickoff.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="mt-5 grid gap-4">
                        <UserPredictionMatchSummary match={match} />

                        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-3 text-sm text-slate-700">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-blue-950">
                                    Current pick:
                                </span>
                                <span>
                                    {currentPredictionLabel ??
                                        'No pick selected yet'}
                                </span>
                                {currentScoreLabel && (
                                    <span className="rounded-full border border-cyan-100 bg-white px-2.5 py-1 text-xs font-bold text-slate-700">
                                        Score: {currentScoreLabel}
                                    </span>
                                )}
                                {currentConfidence && (
                                    <span className="rounded-full border border-cyan-100 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 capitalize">
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
