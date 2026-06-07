import LeaderboardEmptyState from '@/components/leaderboards/leaderboard-empty-state';
import { Badge } from '@/components/ui/feedback/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import type { LeaderboardEntry } from '@/types/leaderboard';
import PositionMetric from './position-metric';

type Props = {
    currentUserPosition: LeaderboardEntry | null;
    topPosition: LeaderboardEntry | null;
    totalPlayers: number;
};

export default function YourPositionCard({
    currentUserPosition,
    topPosition,
    totalPlayers,
}: Props) {
    const pointsBehindLeader =
        currentUserPosition && topPosition
            ? Math.max(
                  0,
                  topPosition.totalPoints - currentUserPosition.totalPoints,
              )
            : null;

    return (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-2 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900 sm:text-2xl">
                            Your position
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                            Your current place in the full MondialIQ rankings.
                        </CardDescription>
                    </div>
                    {currentUserPosition && (
                        <Badge
                            variant="outline"
                            className="rounded-full border-cyan-200 bg-cyan-50 px-2.5 py-1 font-bold text-cyan-600"
                        >
                            Rank #{currentUserPosition.rank}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6">
                {currentUserPosition ? (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 px-5 py-5 text-white shadow-sm">
                            <p className="text-xs font-bold tracking-wide text-cyan-100 uppercase">
                                Current rank
                            </p>
                            <p className="mt-2 text-4xl font-bold tracking-tight">
                                #{currentUserPosition.rank}
                            </p>
                            <p className="mt-2 text-sm text-cyan-100">
                                Out of {totalPlayers}{' '}
                                {totalPlayers === 1 ? 'player' : 'players'}
                            </p>
                            {pointsBehindLeader !== null && (
                                <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 ">
                                    <p className="text-xs font-semibold text-cyan-50">
                                        {pointsBehindLeader === 0
                                            ? 'You are currently leading the table.'
                                            : `You are ${pointsBehindLeader} pts behind rank #1.`}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <PositionMetric
                                label="Points"
                                value={`${currentUserPosition.totalPoints}`}
                                suffix="pts"
                            />
                            <PositionMetric
                                label="Predictions"
                                value={`${currentUserPosition.predictionsCount}`}
                                suffix={
                                    currentUserPosition.predictionsCount === 1
                                        ? 'match'
                                        : 'matches'
                                }
                            />
                        </div>
                    </div>
                ) : (
                    <LeaderboardEmptyState
                        title="No position yet"
                        description="Your personal ranking will show up here once your picks start scoring in the leaderboard."
                        className="px-4 py-6"
                    />
                )}
            </CardContent>
        </Card>
    );
}
