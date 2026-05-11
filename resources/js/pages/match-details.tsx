import { Head } from '@inertiajs/react';
import MatchDetailsHero from '@/components/matches/details/match-details-hero';
import MatchEventsCard from '@/components/matches/details/match-events-card';
import MatchInfoCard from '@/components/matches/details/match-info-card';
import MatchScoreCard from '@/components/matches/details/match-score-card';
import MatchStatsCard from '@/components/matches/details/match-stats-card';
import BackButton from '@/components/navigation/back-button';
import type { MatchDetails as MatchDetailsType } from '@/types/match-details';

interface Props {
    match: MatchDetailsType;
}

export default function MatchDetails({ match }: Props) {
    return (
        <>
            <Head title={`${match.homeTeam.name} vs ${match.awayTeam.name}`} />

            <div className="mb-5">
                <BackButton />
            </div>

            <div className="flex flex-col gap-5">
                <MatchDetailsHero match={match} />
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <MatchInfoCard match={match} />
                    <MatchScoreCard match={match} />
                </div>
                <MatchEventsCard events={match.events} />
                <MatchStatsCard match={match} />
            </div>
        </>
    );
}
