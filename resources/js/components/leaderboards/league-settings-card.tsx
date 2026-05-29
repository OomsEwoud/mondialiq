import { Form } from '@inertiajs/react';
import {
    PaintBucket,
    PencilLine,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/forms/input-error';
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
import { cn } from '@/lib/utils';
import type { LeagueAccentColor, LeagueCoverStyle } from '@/types/league';
import {
    getLeagueBrandBannerClass,
    leagueAccentOptions,
    leagueCoverOptions,
    leagueIconOptions,
} from '@/utils/league-branding';
import RefreshLeagueCodeController from '@/actions/App/Http/Controllers/Leagues/RefreshLeagueCodeController';
import UpdateLeagueController from '@/actions/App/Http/Controllers/Leagues/UpdateLeagueController';

type Props = {
    leagueId: number;
    leagueName: string;
    leagueIcon: string;
    accentColor: LeagueAccentColor;
    coverStyle: LeagueCoverStyle;
};

const fieldClassName =
    'h-11 rounded-lg border-slate-300 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200';

export default function LeagueSettingsCard({
    leagueId,
    leagueName,
    leagueIcon,
    accentColor,
    coverStyle,
}: Props) {
    const [name, setName] = useState(leagueName);
    const [icon, setIcon] = useState(leagueIcon);
    const [accent, setAccent] = useState<LeagueAccentColor>(accentColor);
    const [cover, setCover] = useState<LeagueCoverStyle>(coverStyle);

    const normalizedName = name.trim();
    const hasChanges =
        normalizedName !== leagueName.trim() ||
        icon !== leagueIcon ||
        accent !== accentColor ||
        cover !== coverStyle;
    const canSubmit = normalizedName.length > 0 && hasChanges;
    
    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                <div className="flex items-center gap-2 text-cyan-700">
                    <ShieldCheck className="size-4" />
                    <p className="text-xs font-black tracking-[0.16em] uppercase">
                        Owner controls
                    </p>
                </div>
                <CardTitle className="text-2xl font-black text-blue-950">
                    League settings
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Shape the look and feel of your league, then keep invite
                    access under control.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-5 sm:px-6">
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
                                    'rounded-2xl p-4 text-white shadow-sm',
                                    getLeagueBrandBannerClass(accent, cover),
                                )}
                            >
                                <p className="text-xs font-black tracking-[0.16em] uppercase text-white/76">
                                    Live preview
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white/18 text-3xl shadow-sm backdrop-blur-sm">
                                        <span aria-hidden="true">{icon}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-lg font-black text-white">
                                            {normalizedName || 'Your league'}
                                        </p>
                                        <p className="text-sm text-white/80">
                                            Private competition with your
                                            friends
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-col gap-2">
                                <Label
                                    htmlFor="league-name"
                                    className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                >
                                    League name
                                </Label>
                                <Input
                                    id="league-name"
                                    name="name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    className={fieldClassName}
                                    placeholder="Your friends league"
                                />
                                <p className="text-xs text-slate-500">
                                    {hasChanges
                                        ? 'Your updated league branding will be visible right away.'
                                        : 'Give the league a name that your group will recognise instantly.'}
                                </p>
                                <div className="min-h-5">
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Sparkles className="size-4 text-cyan-600" />
                                    <Label className="text-xs font-black tracking-widest text-slate-500 uppercase">
                                        League icon
                                    </Label>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {leagueIconOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIcon(option.value)}
                                            className={cn(
                                                'h-14 rounded-xl border-slate-200 text-2xl hover:bg-slate-50',
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

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <PaintBucket className="size-4 text-cyan-600" />
                                    <Label className="text-xs font-black tracking-widest text-slate-500 uppercase">
                                        Accent color
                                    </Label>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {leagueAccentOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setAccent(option.value)
                                            }
                                            className={cn(
                                                'h-11 justify-start rounded-xl border-slate-200 px-3 font-black hover:bg-slate-50',
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
                                    <InputError
                                        message={errors.accent_color}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <ShieldCheck className="size-4 text-cyan-600" />
                                    <Label className="text-xs font-black tracking-widest text-slate-500 uppercase">
                                        Cover style
                                    </Label>
                                </div>
                                <div className="grid gap-2">
                                    {leagueCoverOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setCover(option.value)
                                            }
                                            className={cn(
                                                'h-auto items-start justify-start rounded-xl border-slate-200 px-4 py-3 text-left hover:bg-slate-50',
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

                            <Button
                                disabled={processing || !canSubmit}
                                className="h-11 rounded-lg px-5 font-black"
                            >
                                {processing && <Spinner />}
                                <PencilLine className="size-4" />
                                {processing
                                    ? 'Saving...'
                                    : 'Save league branding'}
                            </Button>
                        </>
                    )}
                </Form>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <p className="text-sm font-black text-amber-900">
                        Refreshing the invite code invalidates the old code for
                        new members.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-800">
                        Existing members keep their access, but future joins
                        must use the new code.
                    </p>
                    <p className="mt-2 text-xs font-semibold tracking-[0.04em] text-amber-900">
                        Use this when an old invite code has already been shared
                        too widely.
                    </p>

                    <Form
                        {...RefreshLeagueCodeController.form({
                            scoreboard: leagueId,
                        })}
                        options={{ preserveScroll: true }}
                        className="mt-4"
                    >
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={processing}
                                className="h-11 w-full rounded-lg border-amber-300 bg-white px-5 font-black text-amber-900 hover:bg-amber-100 sm:w-auto"
                            >
                                {processing && <Spinner />}
                                <RefreshCcw className="size-4" />
                                {processing
                                    ? 'Refreshing...'
                                    : 'Refresh invite code'}
                            </Button>
                        )}
                    </Form>
                </div>
            </CardContent>
        </Card>
    );
}
