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
    3: 'border-orange-200 bg-orange-50 text-orange-700',
};

export default function GlobalLeaderboardCard({
    leaders,
    currentUserId,
}: Props) {
    const getInitials = useInitials();

    return (
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-2 border-b border-slate-200 px-4 py-5 sm:px-6">
                <CardTitle className="text-2xl font-black text-blue-950">
                    Global Leaderboard
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    The strongest prediction runs across MondialIQ right now.
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
                                        'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 transition-colors sm:px-6',
                                        isCurrentUser &&
                                            'bg-cyan-50/70 ring-1 ring-cyan-100 ring-inset',
                                        isTopThree &&
                                            !isCurrentUser &&
                                            'bg-linear-to-r from-slate-50 to-white',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex min-w-11 items-center justify-center rounded-full border px-3 py-2 text-sm font-black',
                                            topRankStyles[leader.rank] ??
                                                'border-slate-200 bg-slate-50 text-blue-950',
                                        )}
                                    >
                                        #{leader.rank}
                                    </div>

                                    <div className="flex min-w-0 items-center gap-3">
                                        <Avatar className="size-11 rounded-2xl ring-1 ring-slate-200">
                                            <AvatarImage
                                                src={leader.avatar ?? undefined}
                                                alt={leader.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-blue-950 text-xs font-black text-white">
                                                {getInitials(leader.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate text-sm font-black text-blue-950 sm:text-base">
                                                    {leader.name}
                                                </p>
                                                {isCurrentUser && (
                                                    <Badge className="rounded-full bg-cyan-500 px-2 py-0.5 text-[11px] font-black text-blue-950">
                                                        You
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                                {leader.predictionsCount}{' '}
                                                {leader.predictionsCount === 1
                                                    ? 'prediction'
                                                    : 'predictions'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xl font-black text-cyan-600 sm:text-2xl">
                                            {leader.totalPoints}
                                        </p>
                                        <p className="text-[11px] font-black tracking-[0.18em] text-slate-500 uppercase">
                                            pts
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
