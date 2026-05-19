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
    createLeagueHref?: string | null;
    joinLeagueHref?: string | null;
    currentLeagueCount?: number;
    maxLeagueCount?: number;
};

export default function FriendsLeaguesSection({
    leagues,
    createLeagueHref,
    joinLeagueHref,
    currentLeagueCount = 0,
    maxLeagueCount = 5,
}: Props) {
    const hasReachedLeagueLimit = currentLeagueCount >= maxLeagueCount;

    return (
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-4 border-b border-slate-200 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black text-blue-950">
                            Friends Leagues
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                            Track the private leagues you joined and see where
                            you stand against your friends.
                        </CardDescription>
                        <p className="mt-3 text-sm font-semibold text-slate-600">
                            {currentLeagueCount}/{maxLeagueCount} leagues joined
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        {joinLeagueHref && !hasReachedLeagueLimit ? (
                            <Button
                                asChild
                                variant="outline"
                                className="h-10 w-full rounded-lg px-4 font-black sm:w-auto"
                            >
                                <Link href={joinLeagueHref}>
                                    <LogIn className="size-4" />
                                    Join League
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled
                                variant="outline"
                                className="h-10 w-full rounded-lg px-4 font-black sm:w-auto"
                            >
                                <LogIn className="size-4" />
                                Join League
                            </Button>
                        )}
                        {createLeagueHref && !hasReachedLeagueLimit ? (
                            <Button
                                asChild
                                className="h-10 w-full rounded-lg px-4 font-black sm:w-auto"
                            >
                                <Link href={createLeagueHref}>
                                    <Plus className="size-4" />
                                    Create League
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled
                                className="h-10 w-full rounded-lg px-4 font-black sm:w-auto"
                            >
                                <Plus className="size-4" />
                                Create League
                            </Button>
                        )}
                    </div>
                </div>
                {hasReachedLeagueLimit && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                        <p className="text-sm font-black text-amber-900">
                            You reached the league limit.
                        </p>
                        <p className="mt-1 text-sm leading-6 text-amber-800">
                            Leave one of your current leagues before creating or joining another.
                        </p>
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-4 py-5 sm:px-6">
                {leagues.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {leagues.map((league) => (
                            <FriendsLeagueCard key={league.id} league={league} />
                        ))}
                    </div>
                ) : (
                    <LeaderboardEmptyState
                        title="No friends leagues yet"
                        description="Create your first private league to invite friends, compare picks, and make every matchday more competitive."
                        actionLabel="Create League"
                        actionHref={createLeagueHref}
                    />
                )}
            </CardContent>
        </Card>
    );
}
