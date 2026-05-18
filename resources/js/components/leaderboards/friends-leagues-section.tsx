import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
};

export default function FriendsLeaguesSection({
    leagues,
    createLeagueHref,
}: Props) {
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
                    </div>
                    {createLeagueHref ? (
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
