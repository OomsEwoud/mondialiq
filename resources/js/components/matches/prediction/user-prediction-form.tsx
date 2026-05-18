import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import type * as React from 'react';
import { toast } from 'sonner';
import PredictionConfidenceField from '@/components/matches/prediction/prediction-confidence-field';
import PredictionOutcomeField from '@/components/matches/prediction/prediction-outcome-field';
import PredictionScoreFields from '@/components/matches/prediction/prediction-score-fields';
import { Button } from '@/components/ui/forms/button';
import { store as storePrediction } from '@/routes/matches/prediction';
import type { Match } from '@/types/match';
import type { UserPredictionFormData } from '@/types/match-prediction';
import {
    hasMatchStarted,
    initialPredictionFormData,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
    open: boolean;
    onSaved: () => void;
    onCancel: () => void;
}

export default function UserPredictionForm({
    match,
    open,
    onSaved,
    onCancel,
}: Props) {
    const matchStarted = hasMatchStarted(match);
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<UserPredictionFormData>(initialPredictionFormData(match));

    useEffect(() => {
        if (!open) {
            return;
        }

        setData(initialPredictionFormData(match));
        clearErrors();
    }, [clearErrors, match, open, setData]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(storePrediction.url(match.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Prediction saved.');
                onSaved();
            },
            onError: () => toast.error('Could not save prediction.'),
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-4">
            {matchStarted && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Predictions are closed because this match has already
                    started.
                </div>
            )}

            <PredictionOutcomeField
                match={match}
                value={data.outcome}
                disabled={matchStarted || processing}
                error={errors.outcome}
                onChange={(outcome) => setData('outcome', outcome)}
            />

            <PredictionScoreFields
                match={match}
                homeScore={data.home_score}
                awayScore={data.away_score}
                disabled={matchStarted || processing}
                homeError={errors.home_score}
                awayError={errors.away_score}
                onHomeScoreChange={(score) => setData('home_score', score)}
                onAwayScoreChange={(score) => setData('away_score', score)}
            />

            <PredictionConfidenceField
                value={data.confidence}
                disabled={matchStarted || processing}
                error={errors.confidence}
                onChange={(confidence) => setData('confidence', confidence)}
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    disabled={processing}
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={processing || matchStarted || data.outcome === ''}
                >
                    {processing
                        ? 'Saving...'
                        : match.userPrediction
                          ? 'Save Changes'
                          : 'Save Prediction'}
                </Button>
            </div>
        </form>
    );
}
