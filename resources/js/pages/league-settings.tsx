import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users } from 'lucide-react';
import LeagueDangerZoneCard from '@/components/leaderboards/league-danger-zone-card';
import LeagueMembersManagementCard from '@/components/leaderboards/league-members-management-card';
import LeagueSettingsCard from '@/components/leaderboards/league-settings-card';
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

    return (
        <>
            <Head title={`${league.name} settings`} />

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
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={league.showHref ?? leaderboards.url()}
                            className="inline-flex items-center gap-2 text-sm font-black text-white/78 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="size-4" />
                            Back to league
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

                    <div className="mt-6 max-w-3xl">
                        <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-white/18 text-3xl shadow-sm backdrop-blur-sm">
                            <span aria-hidden="true">{league.icon}</span>
                        </div>
                        <p className="text-xs font-black tracking-[0.22em] text-white/72 uppercase">
                            League settings
                        </p>
                        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                            Manage {league.name}
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-white/78 sm:text-base">
                            Update league details, visual identity, and access
                            for your members from one dedicated owner page.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge
                                variant="outline"
                                className="rounded-full border-white/20 bg-white/14 px-2.5 py-1 font-semibold text-white"
                            >
                                <Users className="size-3.5" />
                                {league.membersCount}{' '}
                                {league.membersCount === 1
                                    ? 'member'
                                    : 'members'}
                            </Badge>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                    <LeagueMembersManagementCard
                        leagueId={league.id}
                        members={league.members}
                    />

                    <LeagueSettingsCard
                        leagueId={league.id}
                        leagueName={league.name}
                        leagueIcon={league.icon}
                        accentColor={league.accentColor}
                        coverStyle={league.coverStyle}
                    />

                    <LeagueDangerZoneCard
                        leagueId={league.id}
                        leagueName={league.name}
                    />
                </div>
            </div>
        </>
    );
}
