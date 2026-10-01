import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, Gift, Plus } from 'lucide-react';
import StoreLeagueController from '@/actions/App/Http/Controllers/Leagues/StoreLeagueController';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
import PageHeader from '@/components/typography/page-header';
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
    'h-11 w-full rounded-lg border-input bg-card px-3 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-cyan-400 focus-visible:ring-ring';
const secondaryActionClassName =
    'h-11 rounded-lg px-5 font-semibold text-muted-foreground';
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
                <PageHeader
                    eyebrow="Prediction groups"
                    title="Create a prediction group"
                    description="Invite friends and compare your predictions in a shared ranking."
                    actions={
                        <div className="flex flex-col items-start gap-2">
                            <Link
                                href={leaderboards()}
                                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
                            >
                                <ArrowLeft className="size-4" />
                                Back to leaderboards
                            </Link>
                            <span className="text-xs text-muted-foreground">
                                {leagueCountLabel}
                            </span>
                        </div>
                    }
                />

                <Card className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 shadow-sm">
                    <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Prediction group setup
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-muted-foreground">
                            Choose a clear name, optionally add a reward, and we
                            will generate a unique invite code for you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-5 sm:px-6">
                        <div className="mb-5 rounded-xl border border-border bg-muted px-4 py-4">
                            <p className="text-sm font-bold text-foreground">
                                You can join up to {maxLeagueCount} prediction
                                groups.
                            </p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
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
                                            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
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
                                                className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                            >
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                className="min-h-28 rounded-lg border-input bg-card text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-cyan-400 focus-visible:ring-ring"
                                                placeholder="Tell members what this group is for."
                                            />
                                            <InputError
                                                message={errors.description}
                                                className="leading-5"
                                            />
                                        </div>

                                        <div className="rounded-xl border border-border bg-accent/60 p-4">
                                            <div className="flex items-center gap-2 text-primary">
                                                <Gift className="size-4" />
                                                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                                                    Optional reward
                                                </p>
                                            </div>
                                            <div className="mt-4 grid gap-3">
                                                <div>
                                                    <Label
                                                        htmlFor="reward_title"
                                                        className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
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
                                                        className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                                    >
                                                        Reward details
                                                    </Label>
                                                    <Textarea
                                                        id="reward_description"
                                                        name="reward_description"
                                                        className="min-h-24 rounded-lg border-input bg-card text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-cyan-400 focus-visible:ring-ring"
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

                                    <div className="grid gap-4 rounded-xl border border-border bg-muted p-4 sm:grid-cols-2">
                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="visibility"
                                                className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
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
                                                className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
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
                                            className="h-11 rounded-lg px-5 font-semibold"
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
