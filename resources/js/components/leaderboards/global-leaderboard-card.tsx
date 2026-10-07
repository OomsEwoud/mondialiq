import { Link } from '@inertiajs/react';
import { Bot, Eye } from 'lucide-react';
import LeaderboardEmptyState from '@/components/leaderboards/leaderboard-empty-state';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/forms/button';
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
    1: 'border-amber-200 bg-amber-950/40 text-amber-200',
    2: 'border-input bg-muted text-foreground',
    3: 'border-border bg-accent text-primary',
};

export default function GlobalLeaderboardCard({
    leaders,
    currentUserId,
}: Props) {
    const getInitials = useInitials();

    return (
        <Card className="overflow-hidden rounded-2xl border-border bg-gradient-to-b from-card to-card/60 shadow-sm">
            <CardHeader className="gap-2 border-b border-border px-5 py-5 sm:px-6">
                <CardTitle className="text-xl font-bold text-foreground sm:text-2xl">
                    Global leaderboard
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                    Compare total points, prediction volume and the strongest
                    runs across MondialIQ.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {leaders.length > 0 ? (
                    <div className="divide-y divide-border-subtle">
                        {leaders.map((leader) => {
                            const isCurrentUser = leader.id === currentUserId;
                            const isTopThree = leader.rank <= 3;

                            return (
                                <div
                                    key={leader.id}
                                    className={cn(
                                        'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-l-4 border-transparent px-5 py-4 transition-colors sm:px-6',
                                        isCurrentUser &&
                                            'border-border bg-accent/50',
                                        isTopThree &&
                                            !isCurrentUser &&
                                            'bg-muted',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex min-w-11 items-center justify-center rounded-full border px-3 py-2 text-sm font-bold shadow-sm',
                                            topRankStyles[leader.rank] ??
                                                'border-border bg-muted text-foreground',
                                        )}
                                    >
                                        #{leader.rank}
                                    </div>

                                    <div className="flex min-w-0 items-center gap-3">
                                        <Avatar className="size-11 rounded-2xl shadow-sm ring-1 ring-border">
                                            <AvatarImage
                                                src={leader.avatar ?? undefined}
                                                alt={leader.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                                                {getInitials(leader.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate text-sm font-bold text-foreground sm:text-base">
                                                    {leader.name}
                                                </p>
                                                {isCurrentUser && (
                                                    <Badge className="rounded-full border border-border bg-card px-2 py-0.5 text-xs font-semibold text-primary shadow-none">
                                                        You
                                                    </Badge>
                                                )}
                                                {leader.isSystemUser && (
                                                    <Badge className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-foreground shadow-none">
                                                        <Bot className="size-3" />
                                                        AI
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                                                {leader.predictionsCount}{' '}
                                                {leader.predictionsCount === 1
                                                    ? 'prediction'
                                                    : 'predictions'}
                                            </p>
                                            {isCurrentUser &&
                                                leader.predictionsCount ===
                                                    0 && (
                                                    <p className="mt-1 text-xs font-semibold text-primary">
                                                        Make your first
                                                        prediction to start
                                                        scoring.
                                                    </p>
                                                )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-2xl leading-none font-bold text-foreground sm:text-3xl">
                                            {leader.totalPoints}
                                        </p>
                                        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                            PTS
                                        </p>
                                        {leader.publicPredictionsHref && (
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 h-auto px-0 py-0 text-xs font-semibold text-primary hover:bg-transparent hover:text-primary"
                                            >
                                                <Link
                                                    href={
                                                        leader.publicPredictionsHref
                                                    }
                                                >
                                                    <Eye className="mr-1 size-3.5" />
                                                    {leader.isSystemUser
                                                        ? 'See AI predictions'
                                                        : 'See predictions'}
                                                </Link>
                                            </Button>
                                        )}
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
