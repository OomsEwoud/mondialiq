import { Form } from '@inertiajs/react';
import {
    AlertTriangle,
    Gift,
    KeyRound,
    PaintBucket,
    PencilLine,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    Trophy,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import RefreshLeagueCodeController from '@/actions/App/Http/Controllers/Leagues/RefreshLeagueCodeController';
import UpdateLeagueController from '@/actions/App/Http/Controllers/Leagues/UpdateLeagueController';
import InputError from '@/components/forms/input-error';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/overlays/dialog';
import { cn } from '@/lib/utils';
import type {
    LeagueAccentColor,
    LeagueCoverStyle,
    ScoringRules,
} from '@/types/league';
import {
    getLeagueBrandBannerClass,
    leagueAccentOptions,
    leagueCoverOptions,
    leagueIconOptions,
} from '@/utils/league-branding';

type Props = {
    leagueId: number;
    leagueName: string;
    leagueIcon: string;
    leagueCode: string;
    description: string | null;
    rewardTitle: string | null;
    rewardDescription: string | null;
    visibility: 'private' | 'public';
    isActive: boolean;
    accentColor: LeagueAccentColor;
    coverStyle: LeagueCoverStyle;
    scoringRules: ScoringRules;
};

const fieldClassName =
    'h-11 w-full rounded-xl border-slate-200 bg-white px-3 text-slate-900 shadow-none placeholder:text-slate-600 focus-visible:border-cyan-400 focus-visible:ring-cyan-200';

const numberFieldClassName =
    'h-11 w-full rounded-xl border-slate-200 bg-white px-3 text-slate-900 shadow-none placeholder:text-slate-600 focus-visible:border-cyan-400 focus-visible:ring-cyan-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

export default function LeagueSettingsCard({
    leagueId,
    leagueName,
    leagueIcon,
    leagueCode,
    description: initialDescription,
    rewardTitle: initialRewardTitle,
    rewardDescription: initialRewardDescription,
    visibility: initialVisibility,
    isActive: initialIsActive,
    accentColor,
    coverStyle,
    scoringRules: initialScoringRules,
}: Props) {
    const [name, setName] = useState(leagueName);
    const [description, setDescription] = useState(initialDescription ?? '');
    const [rewardTitle, setRewardTitle] = useState(initialRewardTitle ?? '');
    const [rewardDescription, setRewardDescription] = useState(
        initialRewardDescription ?? '',
    );
    const [visibility, setVisibility] = useState<'private' | 'public'>(
        initialVisibility,
    );
    const [isActive, setIsActive] = useState(initialIsActive);
    const [icon, setIcon] = useState(leagueIcon);
    const [accent, setAccent] = useState<LeagueAccentColor>(accentColor);
    const [cover, setCover] = useState<LeagueCoverStyle>(coverStyle);
    const [scoringRules, setScoringRules] = useState<ScoringRules>({
        ...initialScoringRules,
    });
    const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);

    const normalizedName = name.trim();
    const normalizedDescription = description.trim();
    const normalizedRewardTitle = rewardTitle.trim();
    const normalizedRewardDescription = rewardDescription.trim();

    const scoringRulesChanged =
        scoringRules.exact_score_points !==
            initialScoringRules.exact_score_points ||
        scoringRules.correct_result_points !==
            initialScoringRules.correct_result_points ||
        scoringRules.correct_goal_difference_points !==
            initialScoringRules.correct_goal_difference_points ||
        scoringRules.correct_home_goals_points !==
            initialScoringRules.correct_home_goals_points ||
        scoringRules.correct_away_goals_points !==
            initialScoringRules.correct_away_goals_points ||
        scoringRules.boosted_predictions_enabled !==
            initialScoringRules.boosted_predictions_enabled ||
        scoringRules.boosted_predictions_limit !==
            initialScoringRules.boosted_predictions_limit ||
        scoringRules.boosted_confidence_threshold !==
            initialScoringRules.boosted_confidence_threshold ||
        scoringRules.boosted_prediction_bonus_points !==
            initialScoringRules.boosted_prediction_bonus_points;

    const hasChanges =
        normalizedName !== leagueName.trim() ||
        normalizedDescription !== (initialDescription ?? '').trim() ||
        normalizedRewardTitle !== (initialRewardTitle ?? '').trim() ||
        normalizedRewardDescription !==
            (initialRewardDescription ?? '').trim() ||
        visibility !== initialVisibility ||
        isActive !== initialIsActive ||
        icon !== leagueIcon ||
        accent !== accentColor ||
        cover !== coverStyle ||
        scoringRulesChanged;

    const canSubmit = normalizedName.length > 0 && hasChanges;
    const updateIcon = (nextIcon: string) => setIcon(nextIcon);
    const updateAccent = (nextAccent: LeagueAccentColor) =>
        setAccent(nextAccent);
    const updateCover = (nextCover: LeagueCoverStyle) => setCover(nextCover);

    const updateScoringRule = <K extends keyof ScoringRules>(
        key: K,
        value: ScoringRules[K],
    ) => {
        setScoringRules((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-3 px-4 py-5 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <ShieldCheck className="size-4" />
                            <p className="text-xs font-semibold tracking-wide uppercase">
                                Owner controls
                            </p>
                        </div>
                        <CardTitle className="mt-2 text-xl font-semibold text-slate-900">
                            Prediction group settings
                        </CardTitle>
                    </div>
                    <span
                        className={cn(
                            'rounded-full border px-2.5 py-1 text-xs font-semibold',
                            hasChanges
                                ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600',
                        )}
                    >
                        {hasChanges ? 'Unsaved changes' : 'Saved'}
                    </span>
                </div>
                <CardDescription className="text-sm leading-6 text-slate-600">
                    Shape the group, optional reward and invite access from one
                    owner dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-4 pb-5 sm:px-5">
                <Form
                    {...UpdateLeagueController.form({ scoreboard: leagueId })}
                    options={{ preserveScroll: true }}
                    className="space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <input type="hidden" name="icon" value={icon} />
                            <input
                                type="hidden"
                                name="accent_color"
                                value={accent}
                            />
                            <input
                                type="hidden"
                                name="cover_style"
                                value={cover}
                            />
                            <input
                                type="hidden"
                                name="scoring_rules[exact_score_points]"
                                value={scoringRules.exact_score_points}
                            />
                            <input
                                type="hidden"
                                name="scoring_rules[correct_result_points]"
                                value={scoringRules.correct_result_points}
                            />
                            <input
                                type="hidden"
                                name="scoring_rules[correct_goal_difference_points]"
                                value={
                                    scoringRules.correct_goal_difference_points
                                }
                            />
                            <input
                                type="hidden"
                                name="scoring_rules[correct_home_goals_points]"
                                value={scoringRules.correct_home_goals_points}
                            />
                            <input
                                type="hidden"
                                name="scoring_rules[correct_away_goals_points]"
                                value={scoringRules.correct_away_goals_points}
                            />
                            <input
                                type="hidden"
                                name="scoring_rules[boosted_predictions_enabled]"
                                value={
                                    scoringRules.boosted_predictions_enabled
                                        ? '1'
                                        : '0'
                                }
                            />
                            <input
                                type="hidden"
                                name="scoring_rules[boosted_predictions_limit]"
                                value={scoringRules.boosted_predictions_limit}
                            />
                            <input
                                type="hidden"
                                name="scoring_rules[boosted_confidence_threshold]"
                                value={
                                    scoringRules.boosted_confidence_threshold
                                }
                            />
                            <input
                                type="hidden"
                                name="scoring_rules[boosted_prediction_bonus_points]"
                                value={
                                    scoringRules.boosted_prediction_bonus_points
                                }
                            />

                            <div
                                className={cn(
                                    'rounded-2xl border border-white/20 p-4 text-white shadow-sm',
                                    getLeagueBrandBannerClass(accent, cover),
                                )}
                            >
                                <p className="text-xs font-semibold tracking-wide text-white uppercase">
                                    Live preview
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-2xl shadow-sm">
                                        <span aria-hidden="true">{icon}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-lg font-semibold text-white">
                                            {normalizedName || 'Your group'}
                                        </p>
                                        <p className="text-sm text-white/80">
                                            {visibility === 'private'
                                                ? 'Private prediction group'
                                                : 'Public prediction group'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <Label
                                    htmlFor="league-name"
                                    className="text-xs font-semibold tracking-wide text-cyan-600 uppercase"
                                >
                                    Group name
                                </Label>
                                <Input
                                    id="league-name"
                                    name="name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    className={fieldClassName}
                                    placeholder="Your prediction group"
                                />
                                <p className="text-xs text-slate-600">
                                    {hasChanges
                                        ? 'Your updated group details will be visible right away.'
                                        : 'Give the group a name that members recognise instantly.'}
                                </p>
                                <div className="min-h-5">
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <Label
                                    htmlFor="group-description"
                                    className="text-xs font-semibold tracking-wide text-cyan-600 uppercase"
                                >
                                    Description
                                </Label>
                                <Textarea
                                    id="group-description"
                                    name="description"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    className="min-h-24 rounded-xl border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-600 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                    placeholder="What is this prediction group about?"
                                />
                                <p className="mt-2 text-xs leading-5 text-slate-600">
                                    Short context for members. Keep it simple:
                                    classmates, work crew, family group, or
                                    matchday challenge.
                                </p>
                                <div className="min-h-5">
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-cyan-50/50 p-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Gift className="size-4" />
                                    <Label className="text-xs font-semibold tracking-wide uppercase">
                                        Optional reward
                                    </Label>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-cyan-900">
                                    Rewards are social notes only. MondialIQ
                                    does not process payments or payouts.
                                </p>
                                <div className="mt-4 grid gap-3">
                                    <div>
                                        <Label
                                            htmlFor="reward-title"
                                            className="text-xs font-semibold tracking-wide text-cyan-600 uppercase"
                                        >
                                            Reward title
                                        </Label>
                                        <Input
                                            id="reward-title"
                                            name="reward_title"
                                            value={rewardTitle}
                                            onChange={(event) =>
                                                setRewardTitle(
                                                    event.target.value,
                                                )
                                            }
                                            className={fieldClassName}
                                            placeholder="Winner gets pizza"
                                        />
                                        <InputError
                                            message={errors.reward_title}
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="reward-description"
                                            className="text-xs font-semibold tracking-wide text-cyan-600 uppercase"
                                        >
                                            Reward details
                                        </Label>
                                        <Textarea
                                            id="reward-description"
                                            name="reward_description"
                                            value={rewardDescription}
                                            onChange={(event) =>
                                                setRewardDescription(
                                                    event.target.value,
                                                )
                                            }
                                            className="min-h-24 rounded-xl border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-600 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                            placeholder="Example: €20 gift card, paid outside MondialIQ."
                                        />
                                        <InputError
                                            message={errors.reward_description}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Trophy className="size-4" />
                                    <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                        Scoring settings
                                    </Label>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    These rules determine how points are
                                    calculated inside this leaderboard.
                                </p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                            Exact score
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={
                                                scoringRules.exact_score_points
                                            }
                                            onChange={(event) =>
                                                updateScoringRule(
                                                    'exact_score_points',
                                                    parseInt(
                                                        event.target.value,
                                                        10,
                                                    ) || 0,
                                                )
                                            }
                                            className={numberFieldClassName}
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    'scoring_rules.exact_score_points'
                                                ]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                            Correct result
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={
                                                scoringRules.correct_result_points
                                            }
                                            onChange={(event) =>
                                                updateScoringRule(
                                                    'correct_result_points',
                                                    parseInt(
                                                        event.target.value,
                                                        10,
                                                    ) || 0,
                                                )
                                            }
                                            className={numberFieldClassName}
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    'scoring_rules.correct_result_points'
                                                ]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                            Correct goal difference
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={
                                                scoringRules.correct_goal_difference_points
                                            }
                                            onChange={(event) =>
                                                updateScoringRule(
                                                    'correct_goal_difference_points',
                                                    parseInt(
                                                        event.target.value,
                                                        10,
                                                    ) || 0,
                                                )
                                            }
                                            className={numberFieldClassName}
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    'scoring_rules.correct_goal_difference_points'
                                                ]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                            Correct home goals
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={
                                                scoringRules.correct_home_goals_points
                                            }
                                            onChange={(event) =>
                                                updateScoringRule(
                                                    'correct_home_goals_points',
                                                    parseInt(
                                                        event.target.value,
                                                        10,
                                                    ) || 0,
                                                )
                                            }
                                            className={numberFieldClassName}
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    'scoring_rules.correct_home_goals_points'
                                                ]
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                            Correct away goals
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={
                                                scoringRules.correct_away_goals_points
                                            }
                                            onChange={(event) =>
                                                updateScoringRule(
                                                    'correct_away_goals_points',
                                                    parseInt(
                                                        event.target.value,
                                                        10,
                                                    ) || 0,
                                                )
                                            }
                                            className={numberFieldClassName}
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    'scoring_rules.correct_away_goals_points'
                                                ]
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Zap className="size-4" />
                                    <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                        Boosted predictions
                                    </Label>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Boosted predictions let members use one of
                                    their limited boosts on a prediction they are
                                    confident about. If the prediction is
                                    correct and the confidence is high enough,
                                    they receive bonus points.
                                </p>
                                <div className="mt-4 flex items-center gap-3">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={
                                            scoringRules.boosted_predictions_enabled
                                        }
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
                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                                Boosted predictions per user
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={20}
                                                value={
                                                    scoringRules.boosted_predictions_limit
                                                }
                                                onChange={(event) =>
                                                    updateScoringRule(
                                                        'boosted_predictions_limit',
                                                        parseInt(
                                                            event.target.value,
                                                            10,
                                                        ) || 0,
                                                    )
                                                }
                                                className={numberFieldClassName}
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        'scoring_rules.boosted_predictions_limit'
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                                Required confidence threshold
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={
                                                    scoringRules.boosted_confidence_threshold
                                                }
                                                onChange={(event) =>
                                                    updateScoringRule(
                                                        'boosted_confidence_threshold',
                                                        parseInt(
                                                            event.target.value,
                                                            10,
                                                        ) || 0,
                                                    )
                                                }
                                                className={numberFieldClassName}
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        'scoring_rules.boosted_confidence_threshold'
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                                Boosted prediction bonus points
                                            </Label>
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
                                                        parseInt(
                                                            event.target.value,
                                                            10,
                                                        ) || 0,
                                                    )
                                                }
                                                className={numberFieldClassName}
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
                                )}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <Label
                                        htmlFor="visibility"
                                        className="text-xs font-semibold tracking-wide text-cyan-600 uppercase"
                                    >
                                        Visibility
                                    </Label>
                                    <select
                                        id="visibility"
                                        name="visibility"
                                        value={visibility}
                                        onChange={(event) =>
                                            setVisibility(
                                                event.target.value as
                                                    | 'private'
                                                    | 'public',
                                            )
                                        }
                                        className={fieldClassName}
                                    >
                                        <option value="private">Private</option>
                                        <option value="public">Public</option>
                                    </select>
                                    <p className="mt-2 text-xs leading-5 text-slate-600">
                                        Private groups remain visible to members
                                        only.
                                    </p>
                                    <InputError message={errors.visibility} />
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <Label
                                        htmlFor="is-active"
                                        className="text-xs font-semibold tracking-wide text-cyan-600 uppercase"
                                    >
                                        Join status
                                    </Label>
                                    <select
                                        id="is-active"
                                        name="is_active"
                                        value={isActive ? '1' : '0'}
                                        onChange={(event) =>
                                            setIsActive(
                                                event.target.value === '1',
                                            )
                                        }
                                        className={fieldClassName}
                                    >
                                        <option value="1">
                                            Active, people can join
                                        </option>
                                        <option value="0">
                                            Inactive, invites closed
                                        </option>
                                    </select>
                                    <p className="mt-2 text-xs leading-5 text-slate-600">
                                        Inactive groups keep existing members
                                        but block new joins.
                                    </p>
                                    <InputError message={errors.is_active} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Sparkles className="size-4 text-slate-600" />
                                    <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                        League icon
                                    </Label>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {leagueIconOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                updateIcon(option.value)
                                            }
                                            className={cn(
                                                'h-12 rounded-xl border-slate-200 text-2xl hover:bg-slate-50 focus-visible:ring-cyan-300',
                                                icon === option.value &&
                                                    'border-cyan-300 bg-cyan-50',
                                            )}
                                        >
                                            <span aria-hidden="true">
                                                {option.value}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                                <div className="min-h-5">
                                    <InputError message={errors.icon} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <PaintBucket className="size-4 text-slate-600" />
                                    <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                        Accent color
                                    </Label>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {leagueAccentOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                updateAccent(option.value)
                                            }
                                            className={cn(
                                                'h-10 justify-start rounded-xl border-slate-200 px-3 font-semibold hover:bg-slate-50 focus-visible:ring-cyan-300',
                                                accent === option.value &&
                                                    'border-cyan-300 bg-cyan-50',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'size-3 rounded-full',
                                                    option.dotClassName,
                                                )}
                                            />
                                            {option.label}
                                        </Button>
                                    ))}
                                </div>
                                <div className="min-h-5">
                                    <InputError message={errors.accent_color} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <ShieldCheck className="size-4 text-slate-600" />
                                    <Label className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                        Cover style
                                    </Label>
                                </div>
                                <div className="mt-3 grid gap-2">
                                    {leagueCoverOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                updateCover(option.value)
                                            }
                                            className={cn(
                                                'h-auto items-start justify-start rounded-xl border-slate-200 px-4 py-3 text-left hover:bg-slate-50 focus-visible:ring-cyan-300',
                                                cover === option.value &&
                                                    'border-cyan-300 bg-cyan-50',
                                            )}
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {option.label}
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                                <div className="min-h-5">
                                    <InputError message={errors.cover_style} />
                                </div>
                            </div>

                            <span
                                className={cn(
                                    'block',
                                    !canSubmit && 'cursor-not-allowed',
                                )}
                            >
                                <Button
                                    disabled={processing || !canSubmit}
                                    className="h-11 w-full rounded-xl bg-slate-900 px-5 font-semibold text-white hover:bg-blue-900 focus-visible:ring-cyan-300 disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-100"
                                >
                                    {processing && <Spinner />}
                                    <PencilLine className="size-4" />
                                    {processing
                                        ? 'Saving...'
                                        : 'Save prediction group'}
                                </Button>
                            </span>
                        </>
                    )}
                </Form>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-4">
                    <div className="flex gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                            <KeyRound className="size-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-amber-950">
                                Invite code
                            </p>
                            <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-slate-900">
                                {leagueCode}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-amber-900">
                                Refreshing invalidates the old code for new
                                joins. Existing members keep access.
                            </p>
                        </div>
                    </div>

                    <Dialog
                        open={refreshDialogOpen}
                        onOpenChange={setRefreshDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-4 h-10 w-full rounded-xl border-amber-300 bg-white px-5 font-semibold text-amber-900 hover:bg-amber-100 focus-visible:ring-amber-300"
                            >
                                <RefreshCcw className="size-4" />
                                Refresh invite code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                            <DialogTitle className="text-slate-900">
                                Refresh invite code?
                            </DialogTitle>
                            <DialogDescription className="text-sm leading-6 text-slate-600">
                                The current code will stop working for future
                                members. People already in the group stay in.
                            </DialogDescription>
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                    Use this only when the current code has been
                                    shared too widely.
                                </div>
                            </div>

                            <Form
                                {...RefreshLeagueCodeController.form({
                                    scoreboard: leagueId,
                                })}
                                onSuccess={() => setRefreshDialogOpen(false)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="rounded-xl font-semibold"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl bg-slate-900 font-semibold text-white hover:bg-blue-900"
                                        >
                                            {processing && <Spinner />}
                                            <RefreshCcw className="size-4" />
                                            {processing
                                                ? 'Refreshing...'
                                                : 'Confirm refresh'}
                                        </Button>
                                    </DialogFooter>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}
