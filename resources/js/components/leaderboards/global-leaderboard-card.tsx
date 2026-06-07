import { Bot } from 'lucide-react';
import LeaderboardEmptyState from '@/components/leaderboards/leaderboard-empty-state';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { Badge } from '@/components/ui/feedback/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/leaderboard';

type Props = {
    leaders: LeaderboardEntry[];
    currentUserId: number | null;
};

const topRankStyles: Record<number, string> = {
    1: 'border-amber-200 bg-amber-50 text-amber-700',
    2: 'border-slate-300 bg-slate-100 text-slate-700',
    3: 'border-cyan-200 bg-cyan-50 text-cyan-600',
};

export default function GlobalLeaderboardCard({
    leaders,
    currentUserId,
}: Props) {
    const getInitials = useInitials();

    return (
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-gradient-to-b from-white to-slate-50/60 shadow-sm">
            <CardHeader className="gap-2 border-b border-slate-200 px-5 py-5 sm:px-6">
                <CardTitle className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Global leaderboard
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Compare total points, prediction volume and the strongest
                    runs across MondialIQ.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {leaders.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                        {leaders.map((leader) => {
                            const isCurrentUser = leader.id === currentUserId;
                            const isTopThree = leader.rank <= 3;

                            return (
                                <div
                                    key={leader.id}
                                    className={cn(
                                        'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-l-4 border-transparent px-5 py-4 transition-colors sm:px-6',
                                        isCurrentUser &&
                                            'border-cyan-200 bg-cyan-50/50',
                                        isTopThree &&
                                            !isCurrentUser &&
                                            'bg-slate-50',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex min-w-11 items-center justify-center rounded-full border px-3 py-2 text-sm font-bold shadow-sm',
                                            topRankStyles[leader.rank] ??
                                                'border-slate-200 bg-slate-50 text-slate-900',
                                        )}
                                    >
                                        #{leader.rank}
                                    </div>

                                    <div className="flex min-w-0 items-center gap-3">
                                        <Avatar className="size-11 rounded-2xl shadow-sm ring-1 ring-slate-200">
                                            <AvatarImage
                                                src={leader.avatar ?? undefined}
                                                alt={leader.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-slate-800 text-xs font-semibold text-slate-200">
                                                {getInitials(leader.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
                                                    {leader.name}
                                                </p>
                                                {isCurrentUser && (
                                                    <Badge className="rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-xs font-semibold text-cyan-700 shadow-none">
                                                        You
                                                    </Badge>
                                                )}
                                                {leader.isSystemUser && (
                                                    <Badge className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white shadow-none">
                                                        <Bot className="size-3" />
                                                        AI
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                                                {leader.predictionsCount}{' '}
                                                {leader.predictionsCount === 1
                                                    ? 'prediction'
                                                    : 'predictions'}
                                            </p>
                                            {isCurrentUser &&
                                                leader.predictionsCount ===
                                                    0 && (
                                                    <p className="mt-1 text-xs font-semibold text-cyan-600">
                                                        Make your first
                                                        prediction to start
                                                        scoring.
                                                    </p>
                                                )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-2xl leading-none font-bold text-slate-900 sm:text-3xl">
                                            {leader.totalPoints}
                                        </p>
                                        <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                                            PTS
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-4 py-10 sm:px-6">
                        <LeaderboardEmptyState
                            title="No leaderboard yet"
                            description="Once predictions are scoring, the global rankings will show here."
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
