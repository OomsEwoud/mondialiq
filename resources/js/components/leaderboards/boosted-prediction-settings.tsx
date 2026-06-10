import { Zap } from 'lucide-react';
import InputError from '@/components/forms/input-error';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/forms/select';
import { cn } from '@/lib/utils';
import type { ScoringRules } from '@/types/league';
import type { LeagueThemePalette } from '@/utils/league-branding';

type Props = {
    scoringRules: ScoringRules;
    updateScoringRule: <K extends keyof ScoringRules>(
        key: K,
        value: ScoringRules[K],
    ) => void;
    errors: Record<string, string>;
    theme: LeagueThemePalette;
    numberFieldClassName: string;
};

export default function BoostedPredictionSettings({
    scoringRules,
    updateScoringRule,
    errors,
    theme,
    numberFieldClassName,
}: Props) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={cn('flex items-center gap-2', theme.darkAccent)}>
                <Zap className="size-4" />
                <p className="text-xs font-semibold tracking-wide uppercase">
                    Boosted predictions
                </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
                Boosted predictions let members use one of their limited boosts
                on a prediction they are confident about. If the prediction is
                correct and the confidence is high enough, they receive bonus
                points.
            </p>
            <div className="mt-4 flex items-center gap-3">
                <button
                    type="button"
                    role="switch"
                    aria-checked={scoringRules.boosted_predictions_enabled}
                    onClick={() =>
                        updateScoringRule(
                            'boosted_predictions_enabled',
                            !scoringRules.boosted_predictions_enabled,
                        )
                    }
                    className={cn(
                        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors',
                        scoringRules.boosted_predictions_enabled
                            ? 'bg-cyan-500'
                            : 'bg-slate-300',
                    )}
                >
                    <span
                        className={cn(
                            'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
                            scoringRules.boosted_predictions_enabled
                                ? 'translate-x-6'
                                : 'translate-x-1',
                        )}
                    />
                </button>
                <span className="text-sm font-semibold text-slate-900">
                    Enable boosted predictions
                </span>
            </div>
            {scoringRules.boosted_predictions_enabled && (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="flex h-full flex-col justify-between gap-2">
                        <Label
                            className={cn(
                                'text-xs font-semibold tracking-wide uppercase',
                                theme.darkAccent,
                            )}
                        >
                            Boosted predictions per user
                        </Label>
                        <div>
                            <Input
                                type="number"
                                min={0}
                                max={20}
                                value={scoringRules.boosted_predictions_limit}
                                onChange={(event) =>
                                    updateScoringRule(
                                        'boosted_predictions_limit',
                                        parseInt(event.target.value, 10) || 0,
                                    )
                                }
                                className={numberFieldClassName}
                                disabled={
                                    !scoringRules.boosted_predictions_enabled
                                }
                            />
                            <InputError
                                message={
                                    errors[
                                        'scoring_rules.boosted_predictions_limit'
                                    ]
                                }
                            />
                        </div>
                    </div>
                    <div className="flex h-full flex-col justify-between gap-2">
                        <Label
                            className={cn(
                                'text-xs font-semibold tracking-wide uppercase',
                                theme.darkAccent,
                            )}
                        >
                            Required confidence threshold
                        </Label>
                        <div>
                            <Select
                                value={
                                    scoringRules.boosted_confidence_threshold ||
                                    'low'
                                }
                                onValueChange={(value) =>
                                    updateScoringRule(
                                        'boosted_confidence_threshold',
                                        value as 'low' | 'medium' | 'high',
                                    )
                                }
                                disabled={
                                    !scoringRules.boosted_predictions_enabled
                                }
                            >
                                <SelectTrigger className={numberFieldClassName}>
                                    <SelectValue placeholder="Select confidence" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError
                                message={
                                    errors[
                                        'scoring_rules.boosted_confidence_threshold'
                                    ]
                                }
                            />
                        </div>
                    </div>
                    <div className="flex h-full flex-col justify-between gap-2">
                        <Label
                            className={cn(
                                'text-xs font-semibold tracking-wide uppercase',
                                theme.darkAccent,
                            )}
                        >
                            Bonus points
                        </Label>
                        <div>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={
                                    scoringRules.boosted_prediction_bonus_points
                                }
                                onChange={(event) =>
                                    updateScoringRule(
                                        'boosted_prediction_bonus_points',
                                        parseInt(event.target.value, 10) || 0,
                                    )
                                }
                                className={numberFieldClassName}
                                disabled={
                                    !scoringRules.boosted_predictions_enabled
                                }
                            />
                            <InputError
                                message={
                                    errors[
                                        'scoring_rules.boosted_prediction_bonus_points'
                                    ]
                                }
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
