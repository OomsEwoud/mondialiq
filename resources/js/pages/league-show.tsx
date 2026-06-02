import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Crown,
    Settings2,
    Target,
    Trophy,
    Users,
} from 'lucide-react';
import InviteCodeCard from '@/components/leaderboards/invite-code-card';
import LeagueLeaveCard from '@/components/leaderboards/league-leave-card';
import LeagueMembersCard from '@/components/leaderboards/league-members-card';
import LeagueOnboardingCard from '@/components/leaderboards/league-onboarding-card';
import LeagueSnapshotCard from '@/components/leaderboards/league-snapshot-card';
import PageHead from '@/components/seo/page-head';
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
    const heroStats = [
        {
            label: 'Members',
            value: `${league.membersCount} ${memberLabel}`,
            icon: Users,
        },
        {
            label: 'Your rank',
            value: league.currentUserRank
                ? `#${league.currentUserRank}`
                : 'Unranked',
            icon: Trophy,
        },
        {
            label: 'Predictions',
            value: `${league.totalPredictions}`,
            icon: Target,
        },
        {
            label: 'Host',
            value: hostName ?? 'TBD',
            icon: Crown,
        },
    ];

    return (
        <>
            <PageHead
                title={league.name}
                description={`Follow the ${league.name} friends league on MondialIQ with member rankings, prediction points and invite tools.`}
                noIndex
            />

            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <section
                    className={cn(
                        'rounded-2xl p-4 shadow-sm sm:p-6 lg:p-8',
                        getLeagueBrandBannerClass(
                            league.accentColor,
                            league.coverStyle,
                        ),
                    )}
                >
                    <Link
                        href={leaderboards.url()}
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-blue-950/25 px-3.5 py-2 text-sm font-black text-white shadow-sm backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-blue-950/35 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" />
                        Back to leaderboards
                    </Link>

                    <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white/22 text-2xl shadow-sm ring-1 ring-white/20 backdrop-blur-sm sm:size-14 sm:text-3xl">
                                <span aria-hidden="true">{league.icon}</span>
                            </div>
                            <p className="text-xs font-black tracking-[0.22em] text-white/90 uppercase">
                                Friends League
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                                {league.name}
                            </h1>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {heroStats.map((stat) => (
                                    <Badge
                                        key={stat.label}
                                        variant="outline"
                                        className={cn(
                                            'min-w-0 justify-start rounded-full border-white/20 bg-white/14 px-3 py-1.5 font-semibold text-white backdrop-blur-sm',
                                            'shadow-sm ring-1 ring-white/10',
                                            stat.label === 'Your rank' &&
                                                league.currentUserRank &&
                                                'border-white bg-white text-blue-950',
                                        )}
                                    >
                                        <stat.icon className="size-3.5 shrink-0" />
                                        <span className="truncate">
                                            {stat.label}: {stat.value}
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
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
                                        'h-11 w-full rounded-xl bg-white/90 px-5 font-black text-blue-950 shadow-sm backdrop-blur-sm hover:bg-white focus-visible:ring-cyan-300 sm:w-auto',
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
