import MatchDataTabs from '@/components/matches/details/match-data-tabs';
import MatchDetailsHero from '@/components/matches/details/match-details-hero';
import MatchInfoCard from '@/components/matches/details/match-info-card';
import MatchPredictionActionRow from '@/components/matches/details/match-prediction-action-row';
import MatchScoreCard from '@/components/matches/details/match-score-card';
import BackButton from '@/components/navigation/back-button';
import PageHead from '@/components/seo/page-head';
import { useLiveFixturesPolling } from '@/hooks/use-live-fixtures-polling';
import type { MatchDetails as MatchDetailsType } from '@/types/match-details';
import { isLiveStatus } from '@/utils/match-status';

interface Props {
    match: MatchDetailsType;
}

export default function MatchDetails({ match }: Props) {
    const {
        matches: liveMatches,
        lastUpdatedAt,
        hasPollingError,
    } = useLiveFixturesPolling([], {
        enabled: isLiveStatus(match.status, match.statusShort),
    });
    const pageTitle = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
    const liveMatch = liveMatches.find(
        (liveMatch) => liveMatch.id === match.id,
    );

    return (
        <>
            <PageHead
                title={pageTitle}
                description={`View ${match.homeTeam.name} vs ${match.awayTeam.name} match details, kickoff information, lineups, stats and prediction options on MondialIQ.`}
            />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 lg:gap-6">
                <h1 className="sr-only">{pageTitle}</h1>
                <BackButton className="w-fit rounded-xl border border-border bg-card text-foreground shadow-sm hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" />

                <div className="flex flex-col gap-5 lg:gap-6">
                    <MatchDetailsHero
                        match={match}
                        liveMatch={liveMatch}
                        lastUpdatedAt={lastUpdatedAt}
                        hasPollingError={hasPollingError}
                    />
                    <MatchPredictionActionRow match={match} />
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                        <MatchInfoCard match={match} />
                        <MatchScoreCard match={match} />
                    </div>
                    <MatchDataTabs match={match} />
                </div>
            </div>
        </>
    );
}
