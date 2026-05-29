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
    totalPlayers: number;
};

export default function YourPositionCard({
    currentUserPosition,
    totalPlayers,
}: Props) {
    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-2xl font-black text-blue-950">
                            Your Position
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                            Your current place in the full MondialIQ rankings.
                        </CardDescription>
                    </div>
                    {currentUserPosition && (
                        <Badge
                            variant="outline"
                            className="rounded-full border-cyan-200 bg-cyan-50 px-2.5 py-1 font-black text-cyan-700"
                        >
                            Rank #{currentUserPosition.rank}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-5 sm:px-6">
                {currentUserPosition ? (
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-linear-to-br from-blue-950 via-blue-900 to-cyan-600 px-5 py-5 text-white shadow-sm">
                            <p className="text-xs font-black tracking-[0.22em] text-cyan-100 uppercase">
                                Current rank
                            </p>
                            <p className="mt-2 text-4xl font-black tracking-tight">
                                #{currentUserPosition.rank}
                            </p>
                            <p className="mt-2 text-sm text-cyan-100">
                                Out of {totalPlayers}{' '}
                                {totalPlayers === 1 ? 'player' : 'players'}
                            </p>
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