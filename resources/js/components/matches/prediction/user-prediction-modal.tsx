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
    const closeModal = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border-slate-200 bg-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Edit your prediction'
                            : 'Make your prediction'}
                    </DialogTitle>
                    <DialogDescription>
                        Pick the match outcome before kickoff.
                    </DialogDescription>
                </DialogHeader>

                <UserPredictionMatchSummary match={match} />

                {currentPredictionLabel && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                        Current pick:{' '}
                        <span className="font-bold">{currentPredictionLabel}</span>
                    </div>
                )}

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
            </DialogContent>
        </Dialog>
    );
}
