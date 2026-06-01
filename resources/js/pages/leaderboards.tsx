import { Head, usePage } from '@inertiajs/react';
import FriendsLeaguesSection from '@/components/leaderboards/friends-leagues-section';
import GlobalLeaderboardCard from '@/components/leaderboards/global-leaderboard-card';
import LeaderboardsPageHeader from '@/components/leaderboards/leaderboards-page-header';
import YourPositionCard from '@/components/leaderboards/your-position-card';
import type { Auth } from '@/types';
import type { LeaderboardsPageProps } from '@/types/leaderboard';

export default function Leaderboards({
    globalLeaderboard,
    currentUserPosition,
    joinedLeagues,
    createLeagueHref,
    joinLeagueHref,
    scoringGuideHref,
    totalPlayers,
    currentLeagueCount,
    maxLeagueCount,
}: LeaderboardsPageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Leaderboards" />

            <LeaderboardsPageHeader scoringGuideHref={scoringGuideHref} />

            <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
                    <GlobalLeaderboardCard
                        leaders={globalLeaderboard}
                        currentUserId={auth.user?.id ?? null}
                    />
                    <YourPositionCard
                        currentUserPosition={currentUserPosition}
                        totalPlayers={totalPlayers}
                    />
                </div>

                <FriendsLeaguesSection
                    leagues={joinedLeagues}
                    createLeagueHref={createLeagueHref}
                    joinLeagueHref={joinLeagueHref}
                    currentLeagueCount={currentLeagueCount}
                    maxLeagueCount={maxLeagueCount}
                />
            </div>
        </>
    );
}
