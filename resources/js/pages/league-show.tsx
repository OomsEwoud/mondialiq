import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Crown, Users, type LucideIcon } from 'lucide-react';
import InviteCodeCard from '@/components/leaderboards/invite-code-card';
import LeagueMembersCard from '@/components/leaderboards/league-members-card';
import { Badge } from '@/components/ui/feedback/badge';
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
                                />
                                <SnapshotMetric
                                    icon={Users}
                                    label="Members"
                                    value={`${league.membersCount}`}
                                />
                            </CardContent>
                        </Card>

                        <InviteCodeCard
                            code={league.code}
                            joinHref="/leagues/join"
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
};

function SnapshotMetric({ icon: Icon, label, value }: SnapshotMetricProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500">
                <Icon className="size-4 text-cyan-600" />
                <p className="text-xs font-black tracking-[0.16em] uppercase">
                    {label}
                </p>
            </div>
            <p className="mt-2 text-base font-black text-blue-950">{value}</p>
        </div>
    );
}
