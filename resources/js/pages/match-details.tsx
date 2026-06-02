import MatchAvailabilitySection from '@/components/matches/details/match-availability-section';
import MatchDataTabs from '@/components/matches/details/match-data-tabs';
import MatchDetailsHero from '@/components/matches/details/match-details-hero';
import MatchInfoCard from '@/components/matches/details/match-info-card';
import MatchPredictionActionRow from '@/components/matches/details/match-prediction-action-row';
import MatchScoreCard from '@/components/matches/details/match-score-card';
import BackButton from '@/components/navigation/back-button';
import PageHead from '@/components/seo/page-head';
import type { MatchDetails as MatchDetailsType } from '@/types/match-details';

interface Props {
    match: MatchDetailsType;
}

export default function MatchDetails({ match }: Props) {
    const pageTitle = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

    return (
        <>
            <PageHead
                title={pageTitle}
                description={`View ${match.homeTeam.name} vs ${match.awayTeam.name} match details, kickoff information, lineups, stats and prediction options on MondialIQ.`}
            />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:gap-6 lg:py-8">
                <BackButton className="w-fit rounded-2xl border border-cyan-100 bg-white/95 text-slate-700 shadow-lg shadow-cyan-950/6 hover:border-cyan-200 hover:bg-cyan-50/60 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300" />

                <div className="flex flex-col gap-5 lg:gap-6">
                    <MatchDetailsHero match={match} />
                    <MatchPredictionActionRow match={match} />
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                        <MatchInfoCard match={match} />
                        <MatchScoreCard match={match} />
                    </div>
                    <MatchDataTabs match={match} />
                    <MatchAvailabilitySection match={match} />
                </div>
            </div>
        </>
    );
}
