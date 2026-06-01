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
    isPredictionLocked,
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
    const predictionLocked = isPredictionLocked(match);
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
            <PredictionOutcomeField
                match={match}
                value={data.outcome}
                disabled={predictionLocked || processing}
                error={errors.outcome}
                onChange={(outcome) => setData('outcome', outcome)}
            />

            <PredictionScoreFields
                match={match}
                homeScore={data.home_score}
                awayScore={data.away_score}
                disabled={predictionLocked || processing}
                homeError={errors.home_score}
                awayError={errors.away_score}
                onHomeScoreChange={(score) => setData('home_score', score)}
                onAwayScoreChange={(score) => setData('away_score', score)}
            />

            <PredictionConfidenceField
                value={data.confidence}
                disabled={predictionLocked || processing}
                error={errors.confidence}
                onChange={(confidence) => setData('confidence', confidence)}
            />

            <div className="sticky right-0 bottom-0 left-0 -mx-4 -mb-4 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white/95 px-4 pt-4 pb-4 backdrop-blur sm:-mx-6 sm:-mb-4 sm:flex-row sm:justify-end sm:px-6">
                <Button
                    type="button"
                    variant="outline"
                    disabled={processing}
                    onClick={onCancel}
                    className="h-11 rounded-xl border-slate-200 bg-white font-black text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={
                        processing || predictionLocked || data.outcome === ''
                    }
                    className="h-11 rounded-xl bg-blue-950 px-5 font-black text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {predictionLocked
                        ? 'Predictions closed'
                        : processing
                          ? 'Saving...'
                          : match.userPrediction
                            ? 'Save changes'
                            : 'Save prediction'}
                </Button>
            </div>
        </form>
    );
}
