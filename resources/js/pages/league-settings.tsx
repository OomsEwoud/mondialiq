import { Link } from '@inertiajs/react';
import { ArrowLeft, Settings, Users } from 'lucide-react';
import LeagueSettingsCard from '@/components/leaderboards/league-settings-card';
import PageHead from '@/components/seo/page-head';
import { Badge } from '@/components/ui/feedback/badge';
import { cn } from '@/lib/utils';
import { social } from '@/routes';
import type { LeagueSettingsPageProps } from '@/types/league';
import {
    getLeagueThemeBannerClass,
    getLeagueThemePalette,
} from '@/utils/league-branding';

export default function LeagueSettings({ league }: LeagueSettingsPageProps) {
    const theme = getLeagueThemePalette(league.accentColor);
    const backHref = league.showHref ?? social.url();
    const memberLabel = league.membersCount === 1 ? 'member' : 'members';

    return (
        <>
            <PageHead
                title={`${league.name} settings`}
                description={`Manage ${league.name} prediction group reward, invite settings and owner controls on MondialIQ.`}
                noIndex
            />

            <div className="mx-auto max-w-7xl space-y-6">
                <section
                    className={cn(
                        'rounded-2xl p-5 shadow-sm sm:p-6 lg:p-7',
                        getLeagueThemeBannerClass(league.accentColor),
                    )}
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={backHref}
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-secondary/25 px-3.5 py-2 text-sm font-black text-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-secondary/35 hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 focus-visible:outline-none"
                        >
                            <ArrowLeft className="size-4" />
                            Back to group
                        </Link>

                        <Badge
                            variant="outline"
                            className={cn(
                                'rounded-full px-2.5 py-1 font-semibold',
                                theme.badgeBorder,
                                theme.badgeBg,
                                theme.badgeText,
                            )}
                        >
                            Owner page
                        </Badge>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div className="max-w-3xl">
                            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl border border-white/25 bg-card/20 text-3xl shadow-sm backdrop-blur-sm">
                                <span aria-hidden="true">{league.icon}</span>
                            </div>
                            <p className="text-xs font-black tracking-wide text-foreground uppercase">
                                Prediction group settings
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
                                Manage {league.name}
                            </h1>
                            <p
                                className={cn(
                                    'mt-3 text-sm leading-6 sm:text-base',
                                    theme.accentText,
                                )}
                            >
                                Update group details, invite controls, and
                                scoring rules from one owner dashboard.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                            <Badge
                                variant="outline"
                                className="rounded-lg border-white/30 bg-card/20 px-3 py-1.5 font-black text-foreground shadow-sm"
                            >
                                <Users className="size-3.5" />
                                {league.membersCount} {memberLabel}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="rounded-lg border-white/30 bg-card/20 px-3 py-1.5 font-black text-foreground shadow-sm"
                            >
                                {league.visibility === 'private'
                                    ? 'Private group'
                                    : 'Public group'}
                            </Badge>
                            {!league.isActive ? (
                                <Badge
                                    variant="outline"
                                    className="rounded-lg border-white/30 bg-card/20 px-3 py-1.5 font-black text-foreground shadow-sm"
                                >
                                    Invites closed
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                </section>

                {league.membersHref && (
                    <Link
                        href={league.membersHref}
                        className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-colors hover:border-border hover:bg-accent/50 sm:px-6"
                    >
                        <div className="flex items-center gap-4">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary shadow-sm">
                                <Users className="size-5" />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-foreground">
                                    Manage members
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {league.membersCount} {memberLabel} ·
                                    review, transfer ownership, or remove access
                                </p>
                            </div>
                        </div>
                        <Settings className="size-5 text-muted-foreground" />
                    </Link>
                )}

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
                    scoringRules={league.scoringRules}
                />
            </div>
        </>
    );
}
