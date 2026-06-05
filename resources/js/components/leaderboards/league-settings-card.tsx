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
import type { LeagueAccentColor, LeagueCoverStyle } from '@/types/league';
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
};

const fieldClassName =
    'h-11 w-full rounded-xl border-slate-200 bg-white px-3 text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200';

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
    const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);

    const normalizedName = name.trim();
    const normalizedDescription = description.trim();
    const normalizedRewardTitle = rewardTitle.trim();
    const normalizedRewardDescription = rewardDescription.trim();
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
        cover !== coverStyle;
    const canSubmit = normalizedName.length > 0 && hasChanges;
    const updateIcon = (nextIcon: string) => setIcon(nextIcon);
    const updateAccent = (nextAccent: LeagueAccentColor) =>
        setAccent(nextAccent);
    const updateCover = (nextCover: LeagueCoverStyle) => setCover(nextCover);

    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-3 px-4 py-5 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-700">
                            <ShieldCheck className="size-4" />
                            <p className="text-xs font-black tracking-[0.16em] uppercase">
                                Owner controls
                            </p>
                        </div>
                        <CardTitle className="mt-2 text-xl font-black text-blue-950">
                            Prediction group settings
                        </CardTitle>
                    </div>
                    <span
                        className={cn(
                            'rounded-full border px-2.5 py-1 text-[11px] font-black',
                            hasChanges
                                ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                                : 'border-slate-200 bg-slate-50 text-slate-600',
                        )}
                    >
                        {hasChanges ? 'Unsaved changes' : 'Saved'}
                    </span>
                </div>
                <CardDescription className="text-sm leading-6 text-slate-500">
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

                            <div
                                className={cn(
                                    'rounded-2xl border border-white/20 p-4 text-white shadow-sm',
                                    getLeagueBrandBannerClass(accent, cover),
                                )}
                            >
                                <p className="text-xs font-black tracking-[0.16em] text-white uppercase">
                                    Live preview
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-2xl shadow-sm backdrop-blur-sm">
                                        <span aria-hidden="true">{icon}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-lg font-black text-white">
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
                                    className="text-xs font-black tracking-widest text-slate-500 uppercase"
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
                                <p className="text-xs text-slate-500">
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
                                    className="text-xs font-black tracking-widest text-slate-500 uppercase"
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
                                    className="min-h-24 rounded-xl border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                    placeholder="What is this prediction group about?"
                                />
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    Short context for members. Keep it simple:
                                    classmates, work crew, family group, or
                                    matchday challenge.
                                </p>
                                <div className="min-h-5">
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
                                <div className="flex items-center gap-2 text-cyan-700">
                                    <Gift className="size-4" />
                                    <Label className="text-xs font-black tracking-widest uppercase">
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
                                            className="text-xs font-black tracking-widest text-slate-500 uppercase"
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
                                            className="text-xs font-black tracking-widest text-slate-500 uppercase"
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
                                            className="min-h-24 rounded-xl border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                            placeholder="Example: €20 gift card, paid outside MondialIQ."
                                        />
                                        <InputError
                                            message={errors.reward_description}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <Label
                                        htmlFor="visibility"
                                        className="text-xs font-black tracking-widest text-slate-500 uppercase"
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
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        Private groups remain visible to members
                                        only.
                                    </p>
                                    <InputError message={errors.visibility} />
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <Label
                                        htmlFor="is-active"
                                        className="text-xs font-black tracking-widest text-slate-500 uppercase"
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
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        Inactive groups keep existing members
                                        but block new joins.
                                    </p>
                                    <InputError message={errors.is_active} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Sparkles className="size-4 text-cyan-600" />
                                    <Label className="text-xs font-black tracking-widest text-slate-500 uppercase">
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
                                <div className="flex items-center gap-2 text-slate-700">
                                    <PaintBucket className="size-4 text-cyan-600" />
                                    <Label className="text-xs font-black tracking-widest text-slate-500 uppercase">
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
                                                'h-10 justify-start rounded-xl border-slate-200 px-3 font-black hover:bg-slate-50 focus-visible:ring-cyan-300',
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
                                <div className="flex items-center gap-2 text-slate-700">
                                    <ShieldCheck className="size-4 text-cyan-600" />
                                    <Label className="text-xs font-black tracking-widest text-slate-500 uppercase">
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
                                                <p className="font-black text-blue-950">
                                                    {option.label}
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-slate-500">
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
                                    className="h-11 w-full rounded-xl bg-blue-950 px-5 font-black text-white hover:bg-blue-900 focus-visible:ring-cyan-300 disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100"
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
                            <p className="text-sm font-black text-amber-950">
                                Invite code
                            </p>
                            <p className="mt-1 font-mono text-lg font-black tracking-[0.2em] text-blue-950">
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
                                className="mt-4 h-10 w-full rounded-xl border-amber-300 bg-white px-5 font-black text-amber-900 hover:bg-amber-100 focus-visible:ring-amber-300"
                            >
                                <RefreshCcw className="size-4" />
                                Refresh invite code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                            <DialogTitle className="text-blue-950">
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
                                                className="rounded-xl font-black"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl bg-blue-950 font-black text-white hover:bg-blue-900"
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
