import { Form } from '@inertiajs/react';
import {
    AlertTriangle,
    KeyRound,
    PaintBucket,
    PencilLine,
    RefreshCcw,
    ShieldCheck,
    Trophy,
} from 'lucide-react';
import { useState } from 'react';
import RefreshLeagueCodeController from '@/actions/App/Http/Controllers/Leagues/RefreshLeagueCodeController';
import UpdateLeagueController from '@/actions/App/Http/Controllers/Leagues/UpdateLeagueController';
import InputError from '@/components/forms/input-error';
import LeagueDangerZoneCard from '@/components/leaderboards/league-danger-zone-card';
import { Badge } from '@/components/ui/feedback/badge';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';

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
import type { LeagueAccentColor, ScoringRules } from '@/types/league';
import {
    getLeagueThemeBannerClass,
    getLeagueThemePalette,
    leagueIconOptions,
    leagueThemeOptions,
} from '@/utils/league-branding';
import BoostedPredictionSettings from './boosted-prediction-settings';
import LeagueBrandingSettings from './league-branding-settings';
import LeagueRewardSettings from './league-reward-settings';

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
        scoringRulesChanged;

    const canSubmit = normalizedName.length > 0 && hasChanges;
    const updateIcon = (nextIcon: string) => setIcon(nextIcon);
    const updateAccent = (nextAccent: LeagueAccentColor) =>
        setAccent(nextAccent);
    const theme = getLeagueThemePalette(accent);

    const updateScoringRule = <K extends keyof ScoringRules>(
        key: K,
        value: ScoringRules[K],
    ) => {
        setScoringRules((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-3 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div
                            className={cn(
                                'flex items-center gap-2',
                                theme.darkAccent,
                            )}
                        >
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
                                ? cn(
                                      theme.softBorder,
                                      theme.softBg,
                                      theme.softText,
                                  )
                                : 'border-slate-200 bg-slate-50 text-slate-600',
                        )}
                    >
                        {hasChanges ? 'Unsaved changes' : 'Saved'}
                    </span>
                </div>
                <CardDescription className="text-sm leading-6 text-slate-600">
                    Shape the group details, reward, scoring rules and invite
                    access from one owner dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <Form
                    {...UpdateLeagueController.form({ scoreboard: leagueId })}
                    options={{ preserveScroll: true }}
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

                            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                                {/* Main column */}
                                <div className="space-y-6">
                                    {/* Live preview */}
                                    <div
                                        className={cn(
                                            'rounded-2xl border border-white/20 p-5 text-white shadow-sm',
                                            getLeagueThemeBannerClass(accent),
                                        )}
                                    >
                                        <p className="text-xs font-semibold tracking-wide text-white uppercase">
                                            Live preview
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'flex size-12 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-2xl shadow-sm',
                                                    theme.badgeBorder,
                                                )}
                                            >
                                                <span aria-hidden="true">
                                                    {icon}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-semibold text-white">
                                                    {normalizedName ||
                                                        'Your group'}
                                                </p>
                                                <p className="text-sm text-white/80">
                                                    {visibility === 'private'
                                                        ? 'Private prediction group'
                                                        : 'Public prediction group'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Group profile */}
                                    <LeagueBrandingSettings
                                        name={name}
                                        setName={setName}
                                        description={description}
                                        setDescription={setDescription}
                                        errors={
                                            errors as Record<string, string>
                                        }
                                        theme={theme}
                                        fieldClassName={fieldClassName}
                                    />

                                    {/* Reward settings */}
                                    <LeagueRewardSettings
                                        rewardTitle={rewardTitle}
                                        setRewardTitle={setRewardTitle}
                                        rewardDescription={rewardDescription}
                                        setRewardDescription={
                                            setRewardDescription
                                        }
                                        errors={
                                            errors as Record<string, string>
                                        }
                                        theme={theme}
                                        fieldClassName={fieldClassName}
                                    />

                                    {/* Scoring settings */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <div
                                            className={cn(
                                                'flex items-center gap-2',
                                                theme.darkAccent,
                                            )}
                                        >
                                            <Trophy className="size-4" />
                                            <p className="text-xs font-semibold tracking-wide uppercase">
                                                Scoring settings
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            These rules determine how points are
                                            calculated inside this leaderboard.
                                        </p>
                                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <Label
                                                    className={cn(
                                                        'text-xs font-semibold tracking-wide uppercase',
                                                        theme.darkAccent,
                                                    )}
                                                >
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
                                                                event.target
                                                                    .value,
                                                                10,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className={
                                                        numberFieldClassName
                                                    }
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
                                                <Label
                                                    className={cn(
                                                        'text-xs font-semibold tracking-wide uppercase',
                                                        theme.darkAccent,
                                                    )}
                                                >
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
                                                                event.target
                                                                    .value,
                                                                10,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className={
                                                        numberFieldClassName
                                                    }
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
                                                <Label
                                                    className={cn(
                                                        'text-xs font-semibold tracking-wide uppercase',
                                                        theme.darkAccent,
                                                    )}
                                                >
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
                                                                event.target
                                                                    .value,
                                                                10,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className={
                                                        numberFieldClassName
                                                    }
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
                                                <Label
                                                    className={cn(
                                                        'text-xs font-semibold tracking-wide uppercase',
                                                        theme.darkAccent,
                                                    )}
                                                >
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
                                                                event.target
                                                                    .value,
                                                                10,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className={
                                                        numberFieldClassName
                                                    }
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
                                                <Label
                                                    className={cn(
                                                        'text-xs font-semibold tracking-wide uppercase',
                                                        theme.darkAccent,
                                                    )}
                                                >
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
                                                                event.target
                                                                    .value,
                                                                10,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className={
                                                        numberFieldClassName
                                                    }
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

                                    {/* Boosted predictions */}
                                    <BoostedPredictionSettings
                                        scoringRules={scoringRules}
                                        updateScoringRule={updateScoringRule}
                                        errors={
                                            errors as Record<string, string>
                                        }
                                        theme={theme}
                                        numberFieldClassName={
                                            numberFieldClassName
                                        }
                                    />
                                </div>

                                {/* Side column */}
                                <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                                    {/* Access */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <div
                                            className={cn(
                                                'flex items-center gap-2',
                                                theme.darkAccent,
                                            )}
                                        >
                                            <ShieldCheck className="size-4" />
                                            <p className="text-xs font-semibold tracking-wide uppercase">
                                                Privacy
                                            </p>
                                        </div>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <Label
                                                    htmlFor="visibility"
                                                    className={cn(
                                                        'text-xs font-semibold tracking-wide uppercase',
                                                        theme.darkAccent,
                                                    )}
                                                >
                                                    Visibility
                                                </Label>
                                                <select
                                                    id="visibility"
                                                    name="visibility"
                                                    value={visibility}
                                                    onChange={(event) =>
                                                        setVisibility(
                                                            event.target
                                                                .value as
                                                                | 'private'
                                                                | 'public',
                                                        )
                                                    }
                                                    className={fieldClassName}
                                                >
                                                    <option value="private">
                                                        Private
                                                    </option>
                                                    <option value="public">
                                                        Public
                                                    </option>
                                                </select>
                                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                                    Private groups remain
                                                    visible to members only.
                                                </p>
                                                <InputError
                                                    message={errors.visibility}
                                                />
                                            </div>
                                            <div>
                                                <Label
                                                    htmlFor="is-active"
                                                    className={cn(
                                                        'text-xs font-semibold tracking-wide uppercase',
                                                        theme.darkAccent,
                                                    )}
                                                >
                                                    Join status
                                                </Label>
                                                <select
                                                    id="is-active"
                                                    name="is_active"
                                                    value={isActive ? '1' : '0'}
                                                    onChange={(event) =>
                                                        setIsActive(
                                                            event.target
                                                                .value === '1',
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
                                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                                    Inactive groups keep
                                                    existing members but block
                                                    new joins.
                                                </p>
                                                <InputError
                                                    message={errors.is_active}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Appearance */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <div
                                            className={cn(
                                                'flex items-center gap-2',
                                                theme.darkAccent,
                                            )}
                                        >
                                            <PaintBucket className="size-4" />
                                            <p className="text-xs font-semibold tracking-wide uppercase">
                                                Group appearance
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            Choose a visual theme to give your
                                            leaderboard its own identity.
                                        </p>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <Label
                                                    className={cn(
                                                        'text-xs font-semibold tracking-wide uppercase',
                                                        theme.darkAccent,
                                                    )}
                                                >
                                                    Group theme
                                                </Label>
                                                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                                    {leagueThemeOptions.map(
                                                        (option) => {
                                                            const isSelected =
                                                                accent ===
                                                                option.value;

                                                            return (
                                                                <Button
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    type="button"
                                                                    variant="outline"
                                                                    aria-pressed={
                                                                        isSelected
                                                                    }
                                                                    onClick={() =>
                                                                        updateAccent(
                                                                            option.value as LeagueAccentColor,
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        'h-auto flex-col items-stretch justify-start overflow-hidden rounded-xl border-slate-200 p-0 text-left hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                                                                        isSelected &&
                                                                            cn(
                                                                                'border-slate-900/20',
                                                                                'ring-2 ring-offset-2 ring-offset-white',
                                                                                theme.buttonRing,
                                                                            ),
                                                                    )}
                                                                >
                                                                    <div
                                                                        className={cn(
                                                                            'relative h-16 w-full',
                                                                            option.previewClassName,
                                                                        )}
                                                                    >
                                                                        {isSelected && (
                                                                            <Badge className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-900 uppercase shadow-none">
                                                                                Active
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex w-full items-start justify-between gap-3 px-3 py-3">
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-sm font-semibold text-slate-900">
                                                                                {
                                                                                    option.title
                                                                                }{' '}
                                                                                /{' '}
                                                                                {
                                                                                    option.subtitle
                                                                                }
                                                                            </p>
                                                                            <p className="mt-1 text-xs leading-5 whitespace-normal text-slate-600">
                                                                                {
                                                                                    option.description
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                                <InputError
                                                    message={
                                                        errors.accent_color
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label
                                                    className={cn(
                                                        'text-xs font-semibold tracking-wide uppercase',
                                                        theme.darkAccent,
                                                    )}
                                                >
                                                    League icon
                                                </Label>
                                                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                                                    {leagueIconOptions.map(
                                                        (option) => (
                                                            <Button
                                                                key={
                                                                    option.value
                                                                }
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    updateIcon(
                                                                        option.value,
                                                                    )
                                                                }
                                                                className={cn(
                                                                    'h-12 rounded-xl border-slate-200 text-2xl hover:bg-slate-50 focus-visible:ring-cyan-300',
                                                                    icon ===
                                                                        option.value &&
                                                                        cn(
                                                                            theme.softBorder,
                                                                            theme.softBg,
                                                                        ),
                                                                )}
                                                            >
                                                                <span aria-hidden="true">
                                                                    {
                                                                        option.value
                                                                    }
                                                                </span>
                                                            </Button>
                                                        ),
                                                    )}
                                                </div>
                                                <div className="min-h-5">
                                                    <InputError
                                                        message={errors.icon}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invite code */}
                                    <div
                                        className={cn(
                                            'rounded-2xl border p-5',
                                            theme.softBg,
                                            theme.softBorder,
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'flex items-center gap-2',
                                                theme.darkAccent,
                                            )}
                                        >
                                            <KeyRound className="size-4" />
                                            <p className="text-xs font-semibold tracking-wide uppercase">
                                                Invite code
                                            </p>
                                        </div>
                                        <p className="mt-3 font-mono text-xl font-bold tracking-wide text-slate-900">
                                            {leagueCode}
                                        </p>
                                        <p
                                            className={cn(
                                                'mt-1 text-xs leading-5',
                                                theme.softText,
                                            )}
                                        >
                                            Refreshing invalidates the old code
                                            for new joins. Existing members keep
                                            access.
                                        </p>
                                        <Dialog
                                            open={refreshDialogOpen}
                                            onOpenChange={setRefreshDialogOpen}
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-3 h-10 w-full rounded-xl border-amber-300 bg-white px-5 font-semibold text-amber-900 hover:bg-amber-100 focus-visible:ring-amber-300"
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
                                                    The current code will stop
                                                    working for future members.
                                                    People already in the group
                                                    stay in.
                                                </DialogDescription>
                                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                                                    <div className="flex items-start gap-2">
                                                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                                        Use this only when the
                                                        current code has been
                                                        shared too widely.
                                                    </div>
                                                </div>

                                                <Form
                                                    {...RefreshLeagueCodeController.form(
                                                        {
                                                            scoreboard:
                                                                leagueId,
                                                        },
                                                    )}
                                                    onSuccess={() =>
                                                        setRefreshDialogOpen(
                                                            false,
                                                        )
                                                    }
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    {({ processing }) => (
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose
                                                                asChild
                                                            >
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
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="rounded-xl bg-slate-900 font-semibold text-white hover:bg-blue-900"
                                                            >
                                                                {processing && (
                                                                    <Spinner />
                                                                )}
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

                                    {/* Danger zone */}
                                    <LeagueDangerZoneCard
                                        leagueId={leagueId}
                                        leagueName={leagueName}
                                    />
                                </div>
                            </div>

                            {/* Sticky save bar */}
                            {hasChanges && (
                                <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:px-6">
                                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-cyan-500" />
                                            <p className="text-sm font-semibold text-slate-700">
                                                Unsaved changes
                                            </p>
                                        </div>
                                        <Button
                                            disabled={processing || !canSubmit}
                                            className="h-10 rounded-xl bg-slate-900 px-6 font-semibold text-white hover:bg-blue-900 focus-visible:ring-cyan-300 disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-100"
                                        >
                                            {processing && <Spinner />}
                                            <PencilLine className="size-4" />
                                            {processing
                                                ? 'Saving...'
                                                : 'Save changes'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
