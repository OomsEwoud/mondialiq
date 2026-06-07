import { Activity, Crown, Target, Users } from 'lucide-react';
import SnapshotMetric from '@/components/leaderboards/snapshot-metric';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import type { LeagueDetails } from '@/types/league';

interface Props {
    league: LeagueDetails;
}

export default function LeagueSnapshotCard({ league }: Props) {
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
                />
                <SnapshotMetric
                    icon={Users}
                    label="Members"
                    value={`${league.membersCount}`}
                />
                <SnapshotMetric
                    icon={Target}
                    label="Total predictions"
                    value={`${league.totalPredictions}`}
                />
                <SnapshotMetric
                    icon={Activity}
                    label="Last activity"
                    value={league.lastActivityLabel ?? 'No predictions yet'}
                />
            </CardContent>
        </Card>
    );
}
