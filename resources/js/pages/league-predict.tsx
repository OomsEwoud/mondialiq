import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import LeagueUpcomingMatchesCard from '@/components/leaderboards/league-upcoming-matches-card';
import PageHead from '@/components/seo/page-head';
import { Badge } from '@/components/ui/feedback/badge';
import { cn } from '@/lib/utils';
import type { LeagueDetailsPageProps } from '@/types/league';
import {
    getLeagueBrandBannerClass,
    getLeagueBrandPalette,
} from '@/utils/league-branding';

export default function LeaguePredict({ league }: LeagueDetailsPageProps) {
    const palette = getLeagueBrandPalette(league.accentColor);

    return (
        <>
            <PageHead
                title={`Predict - ${league.name}`}
                description={`Predict matches and earn points for ${league.name} on MondialIQ.`}
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
                            href={league.showHref || '#'}
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
                            Predict matches
                        </Badge>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div className="max-w-3xl">
                            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-3xl shadow-sm backdrop-blur-sm">
                                <span aria-hidden="true">{league.icon}</span>
                            </div>
                            <p className="text-xs font-black tracking-wide text-white uppercase">
                                Predictions
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                                Predict for {league.name}
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-cyan-300 sm:text-base">
                                Cast your predictions, earn points, and climb
                                the group leaderboard.
                            </p>
                        </div>
                    </div>
                </section>

                <LeagueUpcomingMatchesCard
                    fixtures={league.upcomingFixtures}
                    scoreboardId={league.id}
                    boostsRemaining={league.boostsRemaining}
                    boostedEnabled={league.boostedPredictionsEnabled}
                />
            </div>
        </>
    );
}
