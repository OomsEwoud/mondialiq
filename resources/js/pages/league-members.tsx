import { Link } from '@inertiajs/react';
import { ArrowLeft, Users } from 'lucide-react';
import LeagueMembersManagementCard from '@/components/leaderboards/league-members-management-card';
import PageHead from '@/components/seo/page-head';
import { Badge } from '@/components/ui/feedback/badge';
import { cn } from '@/lib/utils';
import type { LeagueMembersPageProps } from '@/types/league';
import {
    getLeagueThemeBannerClass,
    getLeagueThemePalette,
} from '@/utils/league-branding';

export default function LeagueMembers({
    league,
    members,
}: LeagueMembersPageProps) {
    const theme = getLeagueThemePalette(league.accentColor);
    const memberLabel = league.membersCount === 1 ? 'member' : 'members';

    return (
        <>
            <PageHead
                title={`${league.name} members`}
                description={`Manage ${league.name} prediction group members on MondialIQ.`}
                noIndex
            />

            <div className="mx-auto max-w-7xl space-y-6">
                <section
                    className={cn(
                        'relative overflow-hidden rounded-2xl p-4 text-white shadow-sm ring-1 sm:p-6 lg:p-8',
                        getLeagueThemeBannerClass(league.accentColor),
                    )}
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={league.settingsHref || league.showHref || '#'}
                            className={cn(
                                'inline-flex w-fit items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700/50 hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none',
                                theme.buttonRing,
                            )}
                        >
                            <ArrowLeft className="size-4" />
                            Back to settings
                        </Link>

                        <Badge
                            variant="outline"
                            className={cn(
                                'rounded-full px-2.5 py-1 font-semibold',
                                theme.badgeBg,
                                theme.badgeText,
                            )}
                        >
                            Owner page
                        </Badge>
                    </div>

                    <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div
                                className={cn(
                                    'mb-3 flex size-12 items-center justify-center rounded-xl border bg-slate-800/50 text-2xl shadow-sm ring-1 sm:size-14 sm:text-3xl',
                                    theme.badgeBorder,
                                )}
                            >
                                <span aria-hidden="true">{league.icon}</span>
                            </div>
                            <p
                                className={cn(
                                    'text-xs font-semibold tracking-wide uppercase',
                                    theme.accentText,
                                )}
                            >
                                Member management
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                                {league.name} members
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                                Review members, transfer ownership, or remove
                                access when a group invite is no longer meant
                                for someone.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'w-full justify-center rounded-full px-3 py-1.5 text-xs font-semibold sm:w-auto',
                                    theme.badgeBorder,
                                    theme.badgeBg,
                                    theme.badgeText,
                                )}
                            >
                                <Users
                                    className={cn(
                                        'mr-2 size-3.5 shrink-0',
                                        theme.iconColor,
                                    )}
                                />
                                {league.membersCount} {memberLabel}
                            </Badge>
                        </div>
                    </div>
                </section>

                <LeagueMembersManagementCard
                    leagueId={league.id}
                    members={members}
                />
            </div>
        </>
    );
}
