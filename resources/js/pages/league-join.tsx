import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, LogIn, Ticket, Users } from 'lucide-react';
import JoinLeagueController from '@/actions/App/Http/Controllers/Leagues/JoinLeagueController';
import InputError from '@/components/forms/input-error';
import PublicLeagueCard from '@/components/leaderboards/public-league-card';
import PageHead from '@/components/seo/page-head';
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
import { leaderboards } from '@/routes';
import type { LeagueJoinPageProps } from '@/types/league';

const fieldClassName =
    'h-11 rounded-lg border-slate-300 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200';
const secondaryActionClassName =
    'h-11 rounded-lg px-5 font-semibold text-slate-600';
const inviteCodePlaceholder = 'ABCDEFGH';

export default function LeagueJoin({
    initialCode,
    currentLeagueCount,
    maxLeagueCount,
    hasReachedLeagueLimit,
    publicLeagues,
}: LeagueJoinPageProps) {
    const leagueCountLabel = `${currentLeagueCount}/${maxLeagueCount} groups joined`;
    const leagueLimitCopy = hasReachedLeagueLimit
        ? 'You are already at the prediction group limit. Leave one of your current groups before joining another.'
        : `You currently belong to ${currentLeagueCount} prediction group${currentLeagueCount === 1 ? '' : 's'}.`;

    return (
        <>
            <PageHead
                title="Join Prediction Group"
                description="Join a private MondialIQ prediction group with an invite code or browse public groups to start competing."
                noIndex
            />

            <div className="space-y-8">
                <section className="rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-lg sm:p-8">
                    <Link
                        href={leaderboards.url()}
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700/50 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" />
                        Back to leaderboards
                    </Link>

                    <div className="mt-6 max-w-2xl">
                        <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-slate-800 text-cyan-300">
                            <Ticket className="size-6" />
                        </div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                            Prediction Groups
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                            Join Prediction Group
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                            Enter the group code you received from a friend to
                            join their ranking, or browse open public groups below.
                        </p>
                        <p className="mt-4 text-sm font-semibold text-slate-400">
                            {leagueCountLabel}
                        </p>
                    </div>
                </section>

                <Card className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 shadow-sm">
                    <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            Join with code
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-slate-500">
                            Codes use 8 uppercase letters or numbers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-5 sm:px-6">
                        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-sm font-bold text-slate-900">
                                You can join up to {maxLeagueCount} prediction
                                groups.
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                {leagueLimitCopy}
                            </p>
                        </div>

                        <Form
                            {...JoinLeagueController.form()}
                            options={{ preserveScroll: true }}
                            className="space-y-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="flex min-w-0 flex-col gap-2">
                                        <Label
                                            htmlFor="code"
                                            className="text-xs font-semibold tracking-wide text-slate-500 uppercase"
                                        >
                                            Group code
                                        </Label>
                                        <Input
                                            id="code"
                                            name="code"
                                            className={fieldClassName}
                                            placeholder={inviteCodePlaceholder}
                                            defaultValue={initialCode}
                                            maxLength={8}
                                            autoCapitalize="characters"
                                            autoCorrect="off"
                                        />
                                        <div className="min-h-10">
                                            <InputError
                                                message={errors.code}
                                                className="leading-5"
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
                                            <LogIn className="size-4" />
                                            Join group
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <div className="space-y-4 pt-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Browse public groups</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">Join open prediction groups and compete with other fans instantly.</p>
                    </div>

                    {publicLeagues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center sm:p-12">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Users className="size-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">No public groups are open right now</h3>
                            <p className="mt-1 text-sm text-slate-500">Try joining with an invite code instead.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {publicLeagues.map((league) => (
                                <PublicLeagueCard
                                    key={league.id}
                                    league={league}
                                    isAtLimit={hasReachedLeagueLimit}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
