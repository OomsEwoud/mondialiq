import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Crown,
    Gift,
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
    getLeagueHeroPalette,
} from '@/utils/league-branding';

export default function LeagueShow({ league }: LeagueDetailsPageProps) {
    const host = league.members.find((member) => member.isOwner);
    const palette = getLeagueBrandPalette(league.accentColor);
    const heroPalette = getLeagueHeroPalette(league.accentColor);
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
                description={`Follow the ${league.name} prediction group on MondialIQ with member rankings, prediction points and invite tools.`}
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
                        className={cn(
                            'inline-flex w-fit items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700/50 hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none',
                            heroPalette.ring,
                        )}
                    >
                        <ArrowLeft className="size-4" />
                        Back to leaderboards
                    </Link>

                    <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div className={cn(
                                'mb-3 flex size-12 items-center justify-center rounded-xl bg-slate-800/50 text-2xl shadow-sm ring-1 sm:size-14 sm:text-3xl',
                                heroPalette.badgeBorder,
                            )}>
                                <span aria-hidden="true">{league.icon}</span>
                            </div>
                            <p className={cn(
                                'text-xs font-semibold tracking-wide uppercase',
                                heroPalette.label,
                            )}>
                                Prediction Group
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                                {league.name}
                            </h1>
                            {league.description && (
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                                    {league.description}
                                </p>
                            )}
                            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {heroStats.map((stat) => (
                                    <Badge
                                        key={stat.label}
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-center rounded-full px-3 py-1.5 text-xs font-semibold',
                                            heroPalette.badgeBorder,
                                            heroPalette.badgeBg,
                                            heroPalette.badgeText,
                                        )}
                                    >
                                        <stat.icon
                                            className={cn(
                                                'size-3.5 shrink-0',
                                                heroPalette.icon,
                                            )}
                                        />
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
                                        'h-11 w-full rounded-lg bg-transparent px-5 font-semibold shadow-sm sm:w-auto',
                                        heroPalette.outlineButton,
                                        heroPalette.ring,
                                    )}
                                >
                                    <Link href={league.settingsHref}>
                                        <Settings2 className="size-4" />
                                        Group settings
                                    </Link>
                                </Button>
                            )}

                            {league.predictHref && (
                                <Button
                                    asChild
                                    className={cn(
                                        'h-11 w-full rounded-lg px-5 font-semibold shadow-sm sm:w-auto',
                                        heroPalette.primaryButton,
                                        heroPalette.ring,
                                    )}
                                >
                                    <Link href={league.predictHref}>
                                        <Target className="size-4" />
                                        Predict matches
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
                    <LeagueMembersCard members={league.members} />

                    <div className="space-y-6">
                        {(league.rewardTitle || league.rewardDescription) && (
                            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-200">
                                        <Gift className="size-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold tracking-wide text-amber-600 uppercase">
                                            Optional reward
                                        </p>
                                        <h2 className="mt-1 text-xl font-bold text-amber-900">
                                            {league.rewardTitle ??
                                                'Reward available'}
                                        </h2>
                                        {league.rewardDescription && (
                                            <p className="mt-2 text-sm leading-6 text-amber-800">
                                                {league.rewardDescription}
                                            </p>
                                        )}
                                        <p className="mt-3 text-xs leading-5 font-medium text-amber-700">
                                            MondialIQ does not process payments
                                            or payouts. This is a social note
                                            from the group owner.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

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
