import { Head } from '@inertiajs/react';
import LeaderboardsPageHeader from '@/components/leaderboards/leaderboards-page-header';
import { Card, CardContent } from '@/components/ui/layout/card';
import type { LeaderboardEntry } from '@/types/leaderboard';

interface Props {
    leaders: LeaderboardEntry[];
}

export default function Leaderboards({ leaders }: Props) {
    return (
        <>
            <Head title="Leaderboards" />

            <LeaderboardsPageHeader />

            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                <CardContent className="p-0">
                    {leaders.length > 0 ? (
                        <div className="divide-y divide-slate-200">
                            {leaders.map((leader) => (
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
                                Once predictions start scoring, the ranking will
                                appear here.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
