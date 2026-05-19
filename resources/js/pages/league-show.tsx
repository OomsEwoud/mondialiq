import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Crown,
    Settings2,
    Target,
    TrendingUp,
    Users,
    type LucideIcon,
} from 'lucide-react';
import InviteCodeCard from '@/components/leaderboards/invite-code-card';
import LeagueMembersCard from '@/components/leaderboards/league-members-card';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/forms/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { leaderboards } from '@/routes';
import type { LeagueDetailsPageProps } from '@/types/league';

export default function LeagueShow({ league }: LeagueDetailsPageProps) {
    return (
        <>
            <Head title={league.name} />

            <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <Link
                        href={leaderboards.url()}
                        className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition-colors hover:text-blue-950"
                    >
                        <ArrowLeft className="size-4" />
                        Back to leaderboards
                    </Link>

                    <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                <Users className="size-6" />
                            </div>
                            <p className="text-xs font-black tracking-[0.22em] text-cyan-600 uppercase">
                                Friends League
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">
                                {league.name}
                            </h1>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-600"
                                >
                                    <Users className="size-3.5" />
                                    {league.membersCount}{' '}
                                    {league.membersCount === 1
                                        ? 'member'
                                        : 'members'}
                                </Badge>
                                {league.currentUserRank && (
                                    <Badge className="rounded-full bg-cyan-500 px-2.5 py-1 font-black text-blue-950">
                                        Your rank #{league.currentUserRank}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {league.canManage && league.settingsHref && (
                            <Button
                                asChild
                                variant="outline"
                                className="h-11 rounded-lg border-cyan-200 bg-white px-5 font-black text-cyan-900 hover:bg-cyan-50"
                            >
                                <Link href={league.settingsHref}>
                                    <Settings2 className="size-4" />
                                    League settings
                                </Link>
                            </Button>
                        )}
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
                    <LeagueMembersCard members={league.members} />

                    <div className="space-y-6">
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
                                    value={
                                        league.lastActivityLabel ??
                                        'No predictions yet'
                                    }
                                />
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                            <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                                <CardTitle className="text-2xl font-black text-blue-950">
                                    Your gap to the lead
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-500">
                                    See how close you are to taking first place.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 px-4 pb-5 sm:px-6">
                                <div className="rounded-2xl border border-cyan-100 bg-linear-to-r from-cyan-50 via-white to-blue-50 px-4 py-4">
                                    <div className="flex items-center gap-2 text-cyan-700">
                                        <TrendingUp className="size-4" />
                                        <p className="text-xs font-black tracking-[0.16em] uppercase">
                                            Race summary
                                        </p>
                                    </div>
                                    <p className="mt-3 text-lg font-black text-blue-950">
                                        {league.gapToLeader.summary}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SnapshotMetric
                                        icon={Crown}
                                        label="Leader points"
                                        value={`${league.leaderPoints}`}
                                        helper="pts"
                                    />
                                    <SnapshotMetric
                                        icon={TrendingUp}
                                        label="Your points"
                                        value={`${league.currentUserPoints}`}
                                        helper="pts"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <InviteCodeCard
                            code={league.code}
                            joinHref={league.joinHref}
                        />

                    </div>
                </div>
            </div>
        </>
    );
}

type SnapshotMetricProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    helper?: string;
};

function SnapshotMetric({ icon: Icon, label, value, helper }: SnapshotMetricProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500">
                <Icon className="size-4 text-cyan-600" />
                <p className="text-xs font-black tracking-[0.16em] uppercase">
                    {label}
                </p>
            </div>
            <p className="mt-2 text-base font-black text-blue-950">{value}</p>
            {helper && (
                <p className="mt-1 text-xs font-semibold text-slate-500">
                    {helper}
                </p>
            )}
        </div>
    );
}
