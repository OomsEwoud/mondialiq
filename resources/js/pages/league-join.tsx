import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, LogIn, Users } from 'lucide-react';
import JoinLeagueController from '@/actions/App/Http/Controllers/Leagues/JoinLeagueController';
import InputError from '@/components/forms/input-error';
import PublicLeagueCard from '@/components/leaderboards/public-league-card';
import PageHead from '@/components/seo/page-head';
import PageHeader from '@/components/typography/page-header';
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
import { social } from '@/routes';
import type { LeagueJoinPageProps } from '@/types/league';

const fieldClassName =
    'h-11 rounded-lg border-input bg-card text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-cyan-400 focus-visible:ring-ring';
const secondaryActionClassName =
    'h-11 rounded-lg px-5 font-semibold text-muted-foreground';
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
                <PageHeader
                    eyebrow="Prediction groups"
                    title="Join a prediction group"
                    description="Enter an invite code or browse public groups to start competing."
                    actions={
                        <div className="flex flex-col items-start gap-2">
                            <Link
                                href={social()}
                                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
                            >
                                <ArrowLeft className="size-4" />
                                Back to Social
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
                            Join with code
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-muted-foreground">
                            Codes use 8 uppercase letters or numbers.
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
                            {...JoinLeagueController.form()}
                            options={{ preserveScroll: true }}
                            className="space-y-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="flex min-w-0 flex-col gap-2">
                                        <Label
                                            htmlFor="code"
                                            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
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
                                            <Link href={social.url()}>
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
                        <h2 className="text-2xl font-bold text-foreground">
                            Browse public groups
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Join open prediction groups and compete with other
                            fans instantly.
                        </p>
                    </div>

                    {publicLeagues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/50 p-8 text-center sm:p-12">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Users className="size-6" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">
                                No public groups are open right now
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Try joining with an invite code instead.
                            </p>
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
