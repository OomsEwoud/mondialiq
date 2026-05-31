import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Crown, Settings2, Users } from 'lucide-react';
import InviteCodeCard from '@/components/leaderboards/invite-code-card';
import LeagueLeaveCard from '@/components/leaderboards/league-leave-card';
import LeagueMembersCard from '@/components/leaderboards/league-members-card';
import LeagueOnboardingCard from '@/components/leaderboards/league-onboarding-card';
import LeagueSnapshotCard from '@/components/leaderboards/league-snapshot-card';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';
import { leaderboards } from '@/routes';
import type { LeagueDetailsPageProps } from '@/types/league';
import {
    getLeagueBrandBannerClass,
    getLeagueBrandPalette,
} from '@/utils/league-branding';

export default function LeagueShow({ league }: LeagueDetailsPageProps) {
    const host = league.members.find((member) => member.isOwner);
    const palette = getLeagueBrandPalette(league.accentColor);
    const memberLabel = league.membersCount === 1 ? 'member' : 'members';
    const hostName = host?.name;

    return (
        <>
            <Head title={league.name} />

            <div className="space-y-6">
                <section
                    className={cn(
                        'rounded-2xl p-5 shadow-sm sm:p-8',
                        getLeagueBrandBannerClass(
                            league.accentColor,
                            league.coverStyle,
                        ),
                    )}
                >
                    <Link
                        href={leaderboards.url()}
                        className="inline-flex items-center gap-2 text-sm font-black text-white/78 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="size-4" />
                        Back to leaderboards
                    </Link>

                    <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-white/18 text-3xl shadow-sm backdrop-blur-sm">
                                <span aria-hidden="true">{league.icon}</span>
                            </div>
                            <p className="text-xs font-black tracking-[0.22em] text-white/72 uppercase">
                                Friends League
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                                {league.name}
                            </h1>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-white/20 bg-white/14 px-2.5 py-1 font-semibold text-white"
                                >
                                    <Users className="size-3.5" />
                                    {league.membersCount} {memberLabel}
                                </Badge>
                                {league.currentUserRank && (
                                    <Badge className="rounded-full bg-white px-2.5 py-1 font-black text-blue-950">
                                        Your rank #{league.currentUserRank}
                                    </Badge>
                                )}
                                {hostName && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'rounded-full px-2.5 py-1 font-semibold',
                                            palette.badge,
                                        )}
                                    >
                                        <Crown className="size-3.5" />
                                        Host: {hostName}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3">
                            {league.canLeave && (
                                <LeagueLeaveCard
                                    leagueId={league.id}
                                    leagueName={league.name}
                                />
                            )}

                            {league.canManage && league.settingsHref && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className={cn(
                                        'h-11 rounded-lg bg-white/92 px-5 font-black shadow-sm backdrop-blur-sm',
                                        palette.button,
                                    )}
                                >
                                    <Link href={league.settingsHref}>
                                        <Settings2 className="size-4" />
                                        League settings
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
                    <LeagueMembersCard members={league.members} />

                    <div className="space-y-6">
                        <LeagueSnapshotCard league={league} />

                        <InviteCodeCard
                            leagueName={league.name}
                            leagueIcon={league.icon}
                            code={league.code}
                            joinHref={league.joinHref}
                            membersCount={league.membersCount}
                        />

                        <LeagueOnboardingCard
                            leagueName={league.name}
                            membersCount={league.membersCount}
                            currentUserPoints={league.currentUserPoints}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
