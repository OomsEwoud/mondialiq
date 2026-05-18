import { Head } from '@inertiajs/react';
import LeaderboardsPageHeader from '@/components/leaderboards/leaderboards-page-header';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import type { LeaderboardsPageProps as Props } from '@/types/leaderboard';

export default function Leaderboards({
    globalLeaders,
    currentUserStanding,
    totalPlayers,
}: Props) {
    return (
        <>
            <Head title="Leaderboards" />

            <LeaderboardsPageHeader />

            <div className="space-y-6">
                <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                    <CardHeader className="gap-2 border-b border-slate-200 px-4 py-4 sm:px-6">
                        <CardTitle className="text-xl font-black text-blue-950">
                            Global Leaderboard
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500">
                            The top 10 prediction players right now.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {globalLeaders.length > 0 ? (
                            <div className="divide-y divide-slate-200">
                                {globalLeaders.map((leader) => (
                                    <div
                                        key={leader.id}
                                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6"
                                    >
                                        <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-blue-950">
                                            #{leader.rank}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-blue-950 sm:text-base">
                                                {leader.name}
                                            </p>
                                            <p className="text-xs text-slate-500 sm:text-sm">
                                                {leader.predictionsCount}{' '}
                                                {leader.predictionsCount === 1
                                                    ? 'prediction'
                                                    : 'predictions'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-cyan-600 sm:text-xl">
                                                {leader.totalPoints}
                                            </p>
                                            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                pts
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm font-semibold text-blue-950">
                                    No leaderboard data yet.
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Once predictions start scoring, the ranking
                                    will appear here.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                    <CardHeader className="gap-2 px-4 py-4 sm:px-6">
                        <CardTitle className="text-xl font-black text-blue-950">
                            Your Position
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500">
                            Your place in the full leaderboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-5 sm:px-6">
                        {currentUserStanding ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-cyan-600">
                                            Current rank
                                        </p>
                                        <p className="mt-1 text-3xl font-black text-blue-950 sm:text-4xl">
                                            #{currentUserStanding.rank}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Out of {totalPlayers}{' '}
                                            {totalPlayers === 1
                                                ? 'player'
                                                : 'players'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-cyan-600">
                                            {currentUserStanding.totalPoints}
                                        </p>
                                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            pts
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                                            {currentUserStanding.predictionsCount}{' '}
                                            {currentUserStanding.predictionsCount ===
                                            1
                                                ? 'prediction'
                                                : 'predictions'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                Your leaderboard position will appear once your
                                account joins the rankings.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
