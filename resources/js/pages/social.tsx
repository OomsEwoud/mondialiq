import { Link, usePage } from '@inertiajs/react';
import FriendsLeaguesSection from '@/components/leaderboards/friends-leagues-section';
import GlobalLeaderboardCard from '@/components/leaderboards/global-leaderboard-card';
import YourPositionCard from '@/components/leaderboards/your-position-card';
import PageHead from '@/components/seo/page-head';
import { Button } from '@/components/ui/forms/button';
import { matches } from '@/routes';
import type { Auth } from '@/types';
import type { LeaderboardsPageProps } from '@/types/leaderboard';

export default function Social({
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
            <PageHead
                title="Social"
                description="Je persoonlijke ranglijst en prediction groups met vrienden."
            />

            <header className="mb-10 max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                    Jouw profiel · Social
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                    Social
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#949d97]">
                    Volg je persoonlijke ranglijst en beheer je prediction
                    groups met vrienden.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                        <Link href={matches()}>Voorspel een wedstrijd</Link>
                    </Button>
                    <Button asChild variant="ghost">
                        <Link href={scoringGuideHref}>Puntentelling</Link>
                    </Button>
                </div>
            </header>

            <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
                    <GlobalLeaderboardCard
                        leaders={globalLeaderboard}
                        currentUserId={auth.user?.id ?? null}
                    />
                    <YourPositionCard
                        currentUserPosition={currentUserPosition}
                        topPosition={globalLeaderboard[0] ?? null}
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
