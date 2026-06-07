import { Link } from '@inertiajs/react';
import { LogIn, Plus } from 'lucide-react';
import FriendsLeagueCard from '@/components/leaderboards/friends-league-card';
import LeaderboardEmptyState from '@/components/leaderboards/leaderboard-empty-state';
import { Button } from '@/components/ui/forms/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import type { JoinedLeague } from '@/types/leaderboard';

type Props = {
    leagues: JoinedLeague[];
    createLeagueHref: string;
    joinLeagueHref: string;
    currentLeagueCount: number;
    maxLeagueCount: number;
};

export default function FriendsLeaguesSection({
    leagues,
    createLeagueHref,
    joinLeagueHref,
    currentLeagueCount,
    maxLeagueCount,
}: Props) {
    const hasReachedLeagueLimit = currentLeagueCount >= maxLeagueCount;

    return (
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-gradient-to-b from-white to-slate-50/60 shadow-sm">
            <CardHeader className="gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900 sm:text-2xl">
                            Prediction Groups
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                            Create private groups to compare predictions with
                            friends, classmates or your crew.
                        </CardDescription>
                        <p className="mt-3 text-sm font-semibold text-slate-600">
                            {currentLeagueCount}/{maxLeagueCount} groups joined
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        {!hasReachedLeagueLimit ? (
                            <Button
                                asChild
                                variant="outline"
                                className="h-10 w-full rounded-2xl border-slate-200 bg-white px-4 font-bold text-slate-700 shadow-sm hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 sm:w-auto"
                            >
                                <Link href={joinLeagueHref}>
                                    <LogIn className="size-4" />
                                    Join group
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled
                                variant="outline"
                                className="h-10 w-full rounded-lg px-4 font-semibold sm:w-auto"
                            >
                                <LogIn className="size-4" />
                                Join group
                            </Button>
                        )}
                        {!hasReachedLeagueLimit ? (
                            <Button
                                asChild
                                className="h-10 w-full rounded-2xl bg-slate-900 px-4 font-bold text-white shadow-sm focus-visible:ring-cyan-300 sm:w-auto"
                            >
                                <Link href={createLeagueHref}>
                                    <Plus className="size-4" />
                                    Create group
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled
                                className="h-10 w-full rounded-lg px-4 font-semibold sm:w-auto"
                            >
                                <Plus className="size-4" />
                                Create group
                            </Button>
                        )}
                    </div>
                </div>
                {hasReachedLeagueLimit && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm">
                        <p className="text-sm font-bold text-amber-900">
                            You reached the prediction group limit.
                        </p>
                        <p className="mt-1 text-sm leading-6 text-amber-800">
                            Leave one of your current groups before creating or
                            joining another.
                        </p>
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-5 py-5 sm:px-6">
                {leagues.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {leagues.map((league) => (
                            <FriendsLeagueCard
                                key={league.id}
                                league={league}
                            />
                        ))}
                    </div>
                ) : (
                    <LeaderboardEmptyState
                        title="No prediction groups yet"
                        description="Create a private group and invite friends to compete during the tournament."
                        actionLabel="Create group"
                        actionHref={createLeagueHref}
                        actionDisabled={hasReachedLeagueLimit}
                        secondaryActionLabel="Join group"
                        secondaryActionHref={joinLeagueHref}
                        secondaryActionDisabled={hasReachedLeagueLimit}
                    />
                )}
            </CardContent>
        </Card>
    );
}
