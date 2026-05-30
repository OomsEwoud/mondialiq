import { Head, usePage } from '@inertiajs/react';
import FriendsLeaguesSection from '@/components/leaderboards/friends-leagues-section';
import GlobalLeaderboardCard from '@/components/leaderboards/global-leaderboard-card';
import LeaderboardsPageHeader from '@/components/leaderboards/leaderboards-page-header';
import YourPositionCard from '@/components/leaderboards/your-position-card';
import type { Auth } from '@/types';
import type { LeaderboardsPageProps } from '@/types/leaderboard';

export default function Leaderboards(props: LeaderboardsPageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Leaderboards" />

            <LeaderboardsPageHeader />

            <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
                    <GlobalLeaderboardCard
                        leaders={props.globalLeaderboard}
                        currentUserId={auth.user?.id ?? null}
                    />
                    <YourPositionCard
                        currentUserPosition={props.currentUserPosition}
                        totalPlayers={props.totalPlayers}
                    />
                </div>

                <FriendsLeaguesSection
                    leagues={props.joinedLeagues}
                    createLeagueHref={props.createLeagueHref}
                    joinLeagueHref={props.joinLeagueHref}
                    currentLeagueCount={props.currentLeagueCount}
                    maxLeagueCount={props.maxLeagueCount}
                />
            </div>
        </>
    );
}
