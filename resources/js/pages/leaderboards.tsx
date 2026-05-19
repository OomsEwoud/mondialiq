import { Head, usePage } from '@inertiajs/react';
import FriendsLeaguesSection from '@/components/leaderboards/friends-leagues-section';
import GlobalLeaderboardCard from '@/components/leaderboards/global-leaderboard-card';
import LeaderboardsPageHeader from '@/components/leaderboards/leaderboards-page-header';
import YourPositionCard from '@/components/leaderboards/your-position-card';
import type {
    JoinedLeague,
    JoinedLeaguePayload,
    LeaderboardsPageProps as Props,
} from '@/types/leaderboard';
import type { Auth } from '@/types';

export default function Leaderboards(props: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const globalLeaderboard =
        props.globalLeaderboard ?? props.globalLeaders ?? [];
    const currentUserPosition =
        props.currentUserPosition ?? props.currentUserStanding ?? null;
    const joinedLeagues = (props.joinedLeagues ?? []).map(normalizeLeague);
    const totalPlayers =
        props.totalPlayers ??
        currentUserPosition?.rank ??
        globalLeaderboard.length;

    return (
        <>
            <Head title="Leaderboards" />

            <LeaderboardsPageHeader />

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
                    createLeagueHref={props.createLeagueHref}
                    joinLeagueHref={props.joinLeagueHref}
                    currentLeagueCount={props.currentLeagueCount}
                    maxLeagueCount={props.maxLeagueCount}
                />
            </div>
        </>
    );
}

function normalizeLeague(
    league: JoinedLeague | JoinedLeaguePayload,
): JoinedLeague {
    if ('membersCount' in league) {
        return {
            ...league,
            icon: league.icon ?? '🏆',
            accentColor: league.accentColor ?? 'cyan',
            coverStyle: league.coverStyle ?? 'stadium',
            canManage: league.canManage ?? false,
            canLeave: league.canLeave ?? false,
            settingsHref: league.settingsHref ?? null,
            leaveHref: league.leaveHref ?? null,
        };
    }

    return {
        id: league.id,
        name: league.name,
        icon: league.icon ?? '🏆',
        accentColor: league.accent_color ?? 'cyan',
        coverStyle: league.cover_style ?? 'stadium',
        canManage: league.can_manage ?? false,
        canLeave: league.can_leave ?? false,
        membersCount: league.members_count,
        userRank: league.user_rank,
        leaderName: league.leader_name,
        points: league.points ?? null,
        predictionsCount: league.predictions_count ?? null,
        href: league.href ?? null,
        settingsHref: league.settings_href ?? null,
        leaveHref: league.leave_href ?? null,
    };
}
