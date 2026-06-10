import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import LeagueUpcomingMatchesCard from '@/components/leaderboards/league-upcoming-matches-card';
import Pagination from '@/components/navigation/pagination';
import PageHead from '@/components/seo/page-head';
import { cn } from '@/lib/utils';
import type { LeaguePredictPageProps } from '@/types/league';
import {
    getLeagueThemeBannerClass,
    getLeagueThemePalette,
} from '@/utils/league-branding';

export default function LeaguePredict({
    league,
    fixtures,
}: LeaguePredictPageProps) {
    const theme = getLeagueThemePalette(league.accentColor);

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
                        'relative rounded-2xl p-5 shadow-sm sm:p-6 lg:p-7',
                        getLeagueThemeBannerClass(league.accentColor),
                    )}
                >
                    <div className="flex items-start justify-between">
                        <Link
                            href={league.showHref || '#'}
                            className={cn(
                                'inline-flex w-fit items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700/50 hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none',
                                theme.buttonRing,
                            )}
                        >
                            <ArrowLeft className="size-4" />
                            Back to group
                        </Link>
                    </div>

                    <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div
                                className={cn(
                                    'mb-3 flex size-14 items-center justify-center rounded-2xl border bg-white/20 text-3xl shadow-sm backdrop-blur-sm',
                                    theme.badgeBg,
                                    theme.badgeText,
                                )}
                            >
                                <span aria-hidden="true">{league.icon}</span>
                            </div>
                            <p
                                className={cn(
                                    'text-xs font-black tracking-wide uppercase',
                                    theme.badgeBg,
                                )}
                            >
                                Predictions
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                                Predict for {league.name}
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                                Cast your predictions, earn points, and climb
                                the group leaderboard.
                            </p>
                        </div>
                    </div>
                </section>

                <LeagueUpcomingMatchesCard
                    fixtures={fixtures.data}
                    scoreboardId={league.id}
                    boostsRemaining={league.boostsRemaining}
                    boostsLimit={league.boostsLimit}
                    boostedConfidenceThreshold={
                        league.boostedConfidenceThreshold
                    }
                    boostedEnabled={league.boostedPredictionsEnabled}
                />

                <Pagination links={fixtures.links} />
            </div>
        </>
    );
}
