import { Activity, Crown, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import SnapshotMetric from '@/components/leaderboards/snapshot-metric';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import type { LeagueDetails } from '@/types/league';
import { getLeagueHeroPalette } from '@/utils/league-branding';

interface Props {
    league: LeagueDetails;
}

export default function LeagueSnapshotCard({ league }: Props) {
    const heroPalette = getLeagueHeroPalette(league.accentColor);

    return (
        <Card className="gap-0 rounded-2xl border-slate-200 bg-white py-0 shadow-sm">
            <CardHeader className="gap-2 px-4 py-4 sm:px-6">
                <CardTitle className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Group snapshot
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Quick overview of the current race.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 px-4 pb-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-1 2xl:grid-cols-2">
                <SnapshotMetric
                    icon={Crown}
                    label="Current leader"
                    value={league.currentLeader ?? 'TBD'}
                    helper={`${league.leaderPoints} pts`}
                    iconClassName={heroPalette.icon}
                />
                <SnapshotMetric
                    icon={Users}
                    label="Members"
                    value={`${league.membersCount}`}
                    iconClassName={heroPalette.icon}
                />
                <SnapshotMetric
                    icon={Target}
                    label="Total predictions"
                    value={`${league.totalPredictions}`}
                    iconClassName={heroPalette.icon}
                />
                <SnapshotMetric
                    icon={Activity}
                    label="Last activity"
                    value={league.lastActivityLabel ?? 'No predictions yet'}
                    iconClassName={heroPalette.icon}
                />
            </CardContent>
        </Card>
    );
}
