import { Link } from '@inertiajs/react';
import { Crown, Medal, Settings2, Users } from 'lucide-react';
import LeagueLeaveCard from '@/components/leaderboards/league-leave-card';
import LeagueMetric from '@/components/leaderboards/league-metric';
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
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { JoinedLeague } from '@/types/leaderboard';
import {
    getLeagueBrandBannerClass,
    getLeagueBrandPalette,
    getLeagueHeroPalette,
} from '@/utils/league-branding';

type Props = {
    league: JoinedLeague;
};

export default function FriendsLeagueCard({ league }: Props) {
    const getInitials = useInitials();
    const performanceLabel = (() => {
        if (league.points !== null) {
            return `${league.points} pts`;
        }

        if (league.predictionsCount !== null) {
            return `${league.predictionsCount} predictions`;
        }

        return null;
    })();
    const palette = getLeagueBrandPalette(league.accentColor);
    const heroPalette = getLeagueHeroPalette(league.accentColor);
    const memberLabel = league.membersCount === 1 ? 'member' : 'members';

    return (
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div
                className={getLeagueBrandBannerClass(
                    league.accentColor,
                    league.coverStyle,
                )}
            >
                <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
                    <div className={cn(
                        'flex size-12 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-sm ring-1',
                        heroPalette.badgeBorder,
                    )}>
                        <span aria-hidden="true">{league.icon}</span>
                    </div>
                    <div className="min-w-0">
                        <p className={cn(
                            'text-xs font-bold tracking-wide uppercase',
                            heroPalette.label,
                        )}>
                            Prediction group
                        </p>
                        <p className="truncate text-lg font-bold text-white">
                            {league.name}
                        </p>
                    </div>
                </div>
            </div>
            <CardHeader className="gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <CardTitle className="truncate text-lg font-bold text-slate-900">
                            {league.name}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-slate-500">
                            {league.visibility === 'private'
                                ? 'Private prediction group standings.'
                                : 'Public prediction group standings.'}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {league.memberAvatars.map((member) => (
                                <Avatar
                                    key={member.id}
                                    className="size-8 rounded-full shadow-sm ring-2 ring-white"
                                >
                                    <AvatarImage
                                        src={member.avatar ?? undefined}
                                        alt={member.name}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-slate-800 text-xs font-semibold text-slate-200">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                'rounded-full px-2.5 py-1 font-semibold',
                                palette.badge,
                            )}
                        >
                            <Users className={cn('size-3.5', heroPalette.icon)} />
                            {league.membersCount} {memberLabel}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-3 px-4 py-4 sm:px-5">
                <div className="grid grid-cols-2 gap-3">
                    <LeagueMetric
                        icon={Medal}
                        label="Your rank"
                        value={
                            league.userRank !== null
                                ? `#${league.userRank}`
                                : 'Unranked'
                        }
                        iconClassName={heroPalette.icon}
                        labelClassName={heroPalette.label}
                    />
                    <LeagueMetric
                        icon={Crown}
                        label="Current leader"
                        value={league.leaderName ?? 'TBD'}
                        iconClassName={heroPalette.icon}
                        labelClassName={heroPalette.label}
                    />
                </div>

                <div
                    className={cn(
                        'rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3',
                        !performanceLabel && 'text-slate-400',
                    )}
                >
                    <p className={cn(
                        'text-xs font-bold tracking-wide uppercase',
                        heroPalette.label,
                    )}>
                        Group pace
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {performanceLabel ?? 'No scoring data yet'}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="grid gap-3 px-4 pt-0 pb-4 sm:grid-cols-2 sm:px-5">
                <Button
                    asChild
                    className={cn(
                        'h-10 w-full rounded-lg px-4 font-semibold',
                        heroPalette.primaryButton,
                        heroPalette.ring,
                    )}
                >
                    <Link href={league.href}>View group</Link>
                </Button>

                {league.canManage && league.settingsHref ? (
                    <Button
                        asChild
                        variant="outline"
                        className={cn(
                            'h-10 w-full rounded-lg px-4 font-semibold',
                            palette.button,
                        )}
                    >
                        <Link href={league.settingsHref}>
                            <Settings2 className="size-4" />
                            Group settings
                        </Link>
                    </Button>
                ) : league.canLeave ? (
                    <LeagueLeaveCard
                        leagueId={league.id}
                        leagueName={league.name}
                        className="h-10 w-full rounded-2xl border-rose-200 bg-white px-4 font-bold text-rose-900 hover:bg-rose-50"
                    />
                ) : (
                    <Button
                        type="button"
                        disabled
                        variant="outline"
                        className="h-10 w-full rounded-lg px-4 font-semibold"
                    >
                        Group action
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
