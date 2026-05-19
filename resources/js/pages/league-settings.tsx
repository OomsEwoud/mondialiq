import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Settings2, Users } from 'lucide-react'
import LeagueMembersManagementCard from '@/components/leaderboards/league-members-management-card'
import LeagueSettingsCard from '@/components/leaderboards/league-settings-card'
import { Badge } from '@/components/ui/feedback/badge'
import { leaderboards } from '@/routes'
import type { LeagueSettingsPageProps } from '@/types/league'

export default function LeagueSettings({ league }: LeagueSettingsPageProps) {
    return (
        <>
            <Head title={`${league.name} settings`} />

            <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={league.showHref ?? leaderboards.url()}
                            className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition-colors hover:text-blue-950"
                        >
                            <ArrowLeft className="size-4" />
                            Back to league
                        </Link>

                        <Badge
                            variant="outline"
                            className="rounded-full border-cyan-200 bg-cyan-50 px-2.5 py-1 font-semibold text-cyan-800"
                        >
                            Owner page
                        </Badge>
                    </div>

                    <div className="mt-6 max-w-3xl">
                        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                            <Settings2 className="size-6" />
                        </div>
                        <p className="text-xs font-black tracking-[0.22em] text-cyan-600 uppercase">
                            League settings
                        </p>
                        <h1 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">
                            Manage {league.name}
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                            Update league details, transfer ownership, and manage access for your members from one dedicated owner page.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge
                                variant="outline"
                                className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-600"
                            >
                                <Users className="size-3.5" />
                                {league.membersCount}{' '}
                                {league.membersCount === 1 ? 'member' : 'members'}
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
                    />
                </div>
            </div>
        </>
    )
}
