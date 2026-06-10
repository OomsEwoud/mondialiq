import { Activity, Crown, Target, Users } from 'lucide-react';
import SnapshotMetric from '@/components/leaderboards/snapshot-metric';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { cn } from '@/lib/utils';
import type { LeagueDetails } from '@/types/league';
import {
    getLeagueThemeBannerClass,
    getLeagueThemePalette,
} from '@/utils/league-branding';

interface Props {
    league: LeagueDetails;
}

export default function LeagueSnapshotCard({ league }: Props) {
    const theme = getLeagueThemePalette(league.accentColor);

    return (
        <Card
            className={cn(
                'gap-0 rounded-2xl border py-0 shadow-sm',
                theme.softBorder,
                theme.softBg,
            )}
        >
            <CardHeader className="gap-2 px-4 py-4 sm:px-6">
                <CardTitle
                    className={cn(
                        'text-xl font-bold sm:text-2xl',
                        theme.softText,
                    )}
                >
                    Group snapshot
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                    Quick overview of the current race.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 px-4 pb-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-1 2xl:grid-cols-2">
                <SnapshotMetric
                    icon={Crown}
                    label="Current leader"
                    value={league.currentLeader ?? 'TBD'}
                    helper={`${league.leaderPoints} pts`}
                    iconClassName={theme.iconColor}
                    labelClassName={theme.darkAccent}
                    className={cn(theme.softBg, theme.softBorder)}
                />
                <SnapshotMetric
                    icon={Users}
                    label="Members"
                    value={`${league.membersCount}`}
                    iconClassName={theme.iconColor}
                    labelClassName={theme.darkAccent}
                    className={cn(theme.softBg, theme.softBorder)}
                />
                <SnapshotMetric
                    icon={Target}
                    label="Total predictions"
                    value={`${league.totalPredictions}`}
                    iconClassName={theme.iconColor}
                    labelClassName={theme.darkAccent}
                    className={cn(theme.softBg, theme.softBorder)}
                />
                <SnapshotMetric
                    icon={Activity}
                    label="Last activity"
                    value={league.lastActivityLabel ?? 'No predictions yet'}
                    iconClassName={theme.iconColor}
                    labelClassName={theme.darkAccent}
                    className={cn(theme.softBg, theme.softBorder)}
                />
            </CardContent>
        </Card>
    );
}
