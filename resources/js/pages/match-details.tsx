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
                <div className="flex items-center justify-between gap-4">
                    <BackButton />
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Wedstrijdcentrum
                    </p>
                </div>

                <div className="flex flex-col gap-5 lg:gap-6">
                    <MatchDetailsHero
                        match={match}
                        liveMatch={liveMatch}
                        lastUpdatedAt={lastUpdatedAt}
                        hasPollingError={hasPollingError}
                    />
                    <MatchPredictionActionRow match={match} />
                    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6">
                        <MatchDataTabs match={match} />
                        <aside
                            className="flex min-w-0 flex-col gap-5"
                            aria-label="Wedstrijdinformatie"
                        >
                            <MatchInfoCard match={match} />
                            <MatchScoreCard match={match} />
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
