import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, Gift, Plus, Users } from 'lucide-react';
import StoreLeagueController from '@/actions/App/Http/Controllers/Leagues/StoreLeagueController';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
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
import { leaderboards } from '@/routes';
import type { LeagueCreatePageProps } from '@/types';

const fieldClassName =
    'h-11 w-full rounded-lg border-slate-300 bg-white px-3 text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200';
const secondaryActionClassName =
    'h-11 rounded-lg px-5 font-black text-slate-600';
const leagueNamePlaceholder = 'Example: Class 6A Predictions';

export default function LeagueCreate({
    currentLeagueCount,
    maxLeagueCount,
    hasReachedLeagueLimit,
}: LeagueCreatePageProps) {
    const leagueCountLabel = `${currentLeagueCount}/${maxLeagueCount} groups joined`;
    const leagueLimitCopy = hasReachedLeagueLimit
        ? 'You are already at the prediction group limit. Leave one of your current groups before creating a new one.'
        : `You currently belong to ${currentLeagueCount} prediction group${currentLeagueCount === 1 ? '' : 's'}.`;

    return (
        <>
            <PageHead
                title="Create Prediction Group"
                description="Create a private MondialIQ prediction group, invite people with a code and compare World Cup prediction points together."
                noIndex
            />

            <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <Link
                        href={leaderboards.url()}
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" />
                        Back to leaderboards
                    </Link>

                    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                <Users className="size-6" />
                            </div>
                            <p className="text-xs font-black tracking-[0.22em] text-cyan-600 uppercase">
                                Prediction Groups
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">
                                Create a prediction group
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                                Invite friends, classmates or your crew, then
                                compare every prediction matchday in one shared
                                ranking.
                            </p>
                            <p className="mt-4 text-sm font-semibold text-slate-600">
                                {leagueCountLabel}
                            </p>
                        </div>
                    </div>
                </section>

                <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                        <CardTitle className="text-2xl font-black text-blue-950">
                            Prediction group setup
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-slate-500">
                            Choose a clear name, optionally add a reward, and we
                            will generate a unique invite code for you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-5 sm:px-6">
                        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-sm font-black text-blue-950">
                                You can join up to {maxLeagueCount} prediction
                                groups.
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                {leagueLimitCopy}
                            </p>
                        </div>

                        <Form
                            {...StoreLeagueController.form()}
                            options={{ preserveScroll: true }}
                            className="space-y-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="flex min-w-0 flex-col gap-2">
                                        <Label
                                            htmlFor="name"
                                            className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                        >
                                            Group name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            className={fieldClassName}
                                            placeholder={leagueNamePlaceholder}
                                        />
                                        <div className="min-h-10">
                                            <InputError
                                                message={errors.name}
                                                className="leading-5"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="description"
                                                className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                            >
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                className="min-h-28 rounded-lg border-slate-300 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                                placeholder="Tell members what this group is for."
                                            />
                                            <InputError
                                                message={errors.description}
                                                className="leading-5"
                                            />
                                        </div>

                                        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
                                            <div className="flex items-center gap-2 text-cyan-700">
                                                <Gift className="size-4" />
                                                <p className="text-xs font-black tracking-widest uppercase">
                                                    Optional reward
                                                </p>
                                            </div>
                                            <div className="mt-4 grid gap-3">
                                                <div>
                                                    <Label
                                                        htmlFor="reward_title"
                                                        className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                                    >
                                                        Reward title
                                                    </Label>
                                                    <Input
                                                        id="reward_title"
                                                        name="reward_title"
                                                        className={
                                                            fieldClassName
                                                        }
                                                        placeholder="Winner gets pizza"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.reward_title
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label
                                                        htmlFor="reward_description"
                                                        className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                                    >
                                                        Reward details
                                                    </Label>
                                                    <Textarea
                                                        id="reward_description"
                                                        name="reward_description"
                                                        className="min-h-24 rounded-lg border-slate-300 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                                        placeholder="No payment is handled by MondialIQ."
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.reward_description
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="visibility"
                                                className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                            >
                                                Visibility
                                            </Label>
                                            <select
                                                id="visibility"
                                                name="visibility"
                                                defaultValue="private"
                                                className={fieldClassName}
                                            >
                                                <option value="private">
                                                    Private
                                                </option>
                                                <option value="public">
                                                    Public
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.visibility}
                                            />
                                        </div>

                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="is_active"
                                                className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                            >
                                                Join status
                                            </Label>
                                            <select
                                                id="is_active"
                                                name="is_active"
                                                defaultValue="1"
                                                className={fieldClassName}
                                            >
                                                <option value="1">
                                                    Active, people can join
                                                </option>
                                                <option value="0">
                                                    Inactive, invites closed
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.is_active}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <Button
                                            asChild
                                            type="button"
                                            variant="ghost"
                                            className={secondaryActionClassName}
                                        >
                                            <Link href={leaderboards.url()}>
                                                Cancel
                                            </Link>
                                        </Button>
                                        <Button
                                            disabled={
                                                processing ||
                                                hasReachedLeagueLimit
                                            }
                                            className="h-11 rounded-lg px-5 font-black"
                                        >
                                            <Plus className="size-4" />
                                            Create group
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
