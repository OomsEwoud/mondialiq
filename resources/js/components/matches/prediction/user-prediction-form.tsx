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
    scoreboardId?: number;
    boostsRemaining?: number | null;
}

export default function UserPredictionForm({
    match,
    open,
    onSaved,
    onCancel,
    scoreboardId,
    boostsRemaining,
}: Props) {
    const predictionLocked = isPredictionLocked(match);
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<UserPredictionFormData>({
            ...initialPredictionFormData(match),
            scoreboard_id: scoreboardId ? String(scoreboardId) : '',
            is_boosted: false,
        });

    useEffect(() => {
        if (!open) {
            return;
        }

        setData((prevData) => ({
            ...initialPredictionFormData(match),
            scoreboard_id: scoreboardId ? String(scoreboardId) : '',
            is_boosted: prevData.is_boosted && scoreboardId !== undefined,
        }));
        clearErrors();
    }, [clearErrors, match, open, setData, scoreboardId]);

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

    const showBoost =
        scoreboardId !== undefined &&
        typeof boostsRemaining === 'number' &&
        boostsRemaining >= 0;

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

            {showBoost && typeof boostsRemaining === 'number' && (
                <div className="rounded-2xl border border-slate-200 bg-cyan-50/60 p-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={data.is_boosted}
                            disabled={
                                predictionLocked ||
                                processing ||
                                (boostsRemaining === 0 && !data.is_boosted)
                            }
                            onClick={() =>
                                setData('is_boosted', !data.is_boosted)
                            }
                            className={
                                'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ' +
                                (data.is_boosted
                                    ? 'bg-cyan-500'
                                    : 'bg-slate-300')
                            }
                        >
                            <span
                                className={
                                    'inline-block size-5 rounded-full bg-white shadow-sm transition-transform ' +
                                    (data.is_boosted
                                        ? 'translate-x-6'
                                        : 'translate-x-1')
                                }
                            />
                        </button>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Boost this prediction
                            </p>
                            <p className="text-xs text-slate-600">
                                {boostsRemaining === 0 && !data.is_boosted
                                    ? 'You have no boosts remaining in this leaderboard.'
                                    : `${boostsRemaining} of ${boostsRemaining + (data.is_boosted ? 0 : 1)} boosts remaining`}
                            </p>
                        </div>
                    </div>
                    {errors.is_boosted && (
                        <p className="mt-2 text-xs font-medium text-rose-600">
                            {errors.is_boosted}
                        </p>
                    )}
                </div>
            )}

            <div className="sticky right-0 bottom-0 left-0 -mx-4 -mb-4 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white/95 px-4 pt-4 pb-4 sm:-mx-6 sm:-mb-4 sm:flex-row sm:justify-end sm:px-6">
                <Button
                    type="button"
                    variant="outline"
                    disabled={processing}
                    onClick={onCancel}
                    className="h-11 rounded-xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={
                        processing || predictionLocked || data.outcome === ''
                    }
                    className="h-11 rounded-xl bg-blue-950 px-5 font-bold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
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
