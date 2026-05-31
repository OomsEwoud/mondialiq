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
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                <CardTitle className="text-2xl font-black text-blue-950">
                    League Snapshot
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Quick overview of the current race.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-4 pb-5 sm:px-6">
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
