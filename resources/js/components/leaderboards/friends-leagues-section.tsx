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
        <Card className="overflow-hidden rounded-[1.9rem] border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] shadow-xl shadow-cyan-950/8">
            <CardHeader className="gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-blue-950 sm:text-2xl">
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
                                className="h-10 w-full rounded-2xl border-slate-200 bg-white px-4 font-black text-slate-700 shadow-sm shadow-cyan-950/5 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 sm:w-auto"
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
                                className="h-10 w-full rounded-2xl px-4 font-black sm:w-auto"
                            >
                                <LogIn className="size-4" />
                                Join group
                            </Button>
                        )}
                        {!hasReachedLeagueLimit ? (
                            <Button
                                asChild
                                className="h-10 w-full rounded-2xl bg-[linear-gradient(135deg,#16255f_0%,#21326e_100%)] px-4 font-black text-white shadow-lg shadow-blue-950/20 hover:brightness-105 focus-visible:ring-cyan-300 sm:w-auto"
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
                                className="h-10 w-full rounded-2xl px-4 font-black sm:w-auto"
                            >
                                <Plus className="size-4" />
                                Create group
                            </Button>
                        )}
                    </div>
                </div>
                {hasReachedLeagueLimit && (
                    <div className="rounded-[1.5rem] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(253,230,138,0.5))] px-4 py-4 shadow-sm shadow-amber-950/5">
                        <p className="text-sm font-black text-amber-900">
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
