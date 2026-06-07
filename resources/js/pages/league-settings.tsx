import { Link } from '@inertiajs/react';
import { ArrowLeft, Users } from 'lucide-react';
import LeagueDangerZoneCard from '@/components/leaderboards/league-danger-zone-card';
import LeagueMembersManagementCard from '@/components/leaderboards/league-members-management-card';
import LeagueSettingsCard from '@/components/leaderboards/league-settings-card';
import PageHead from '@/components/seo/page-head';
import { Badge } from '@/components/ui/feedback/badge';
import { cn } from '@/lib/utils';
import { leaderboards } from '@/routes';
import type { LeagueSettingsPageProps } from '@/types/league';
import {
    getLeagueBrandBannerClass,
    getLeagueBrandPalette,
} from '@/utils/league-branding';

export default function LeagueSettings({ league }: LeagueSettingsPageProps) {
    const palette = getLeagueBrandPalette(league.accentColor);
    const backHref = league.showHref ?? leaderboards.url();
    const memberLabel = league.membersCount === 1 ? 'member' : 'members';

    return (
        <>
            <PageHead
                title={`${league.name} settings`}
                description={`Manage ${league.name} prediction group members, reward, invite settings and owner controls on MondialIQ.`}
                noIndex
            />

            <div className="mx-auto max-w-7xl space-y-6">
                <section
                    className={cn(
                        'rounded-2xl p-5 shadow-sm sm:p-6 lg:p-7',
                        getLeagueBrandBannerClass(
                            league.accentColor,
                            league.coverStyle,
                        ),
                    )}
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={backHref}
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-blue-950/25 px-3.5 py-2 text-sm font-black text-white shadow-sm backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-blue-950/35 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 focus-visible:outline-none"
                        >
                            <ArrowLeft className="size-4" />
                            Back to group
                        </Link>

                        <Badge
                            variant="outline"
                            className={cn(
                                'rounded-full px-2.5 py-1 font-semibold',
                                palette.badge,
                            )}
                        >
                            Owner page
                        </Badge>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div className="max-w-3xl">
                            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-3xl shadow-sm backdrop-blur-sm">
                                <span aria-hidden="true">{league.icon}</span>
                            </div>
                            <p className="text-xs font-black tracking-wide text-white uppercase">
                                Prediction group settings
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                                Manage {league.name}
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-cyan-300 sm:text-base">
                                Update group details, manage member access, and
                                keep invite controls tidy from one owner
                                dashboard.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                            <Badge
                                variant="outline"
                                className="rounded-lg border-white/30 bg-white/20 px-3 py-1.5 font-black text-white shadow-sm"
                            >
                                <Users className="size-3.5" />
                                {league.membersCount} {memberLabel}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="rounded-lg border-white/30 bg-white/20 px-3 py-1.5 font-black text-white shadow-sm"
                            >
                                {league.visibility === 'private'
                                    ? 'Private group'
                                    : 'Public group'}
                            </Badge>
                            {!league.isActive && (
                                <Badge
                                    variant="outline"
                                    className="rounded-lg border-white/30 bg-white/20 px-3 py-1.5 font-black text-white shadow-sm"
                                >
                                    Invites closed
                                </Badge>
                            )}
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
                    <LeagueMembersManagementCard
                        leagueId={league.id}
                        members={league.members}
                    />

                    <aside className="space-y-6">
                        <LeagueSettingsCard
                            leagueId={league.id}
                            leagueName={league.name}
                            leagueIcon={league.icon}
                            leagueCode={league.code}
                            description={league.description}
                            rewardTitle={league.rewardTitle}
                            rewardDescription={league.rewardDescription}
                            visibility={league.visibility}
                            isActive={league.isActive}
                            accentColor={league.accentColor}
                            coverStyle={league.coverStyle}
                        />

                        <LeagueDangerZoneCard
                            leagueId={league.id}
                            leagueName={league.name}
                        />
                    </aside>
                </div>
            </div>
        </>
    );
}
