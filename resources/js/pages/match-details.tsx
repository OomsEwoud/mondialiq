import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import MatchDetailsHero from '@/components/matches/details/match-details-hero';
import MatchEventsCard from '@/components/matches/details/match-events-card';
import MatchInfoCard from '@/components/matches/details/match-info-card';
import MatchScoreCard from '@/components/matches/details/match-score-card';
import MatchStatsCard from '@/components/matches/details/match-stats-card';
import { matches } from '@/routes';
import type { MatchDetails as MatchDetailsType } from '@/types/match-details';

interface Props {
    match: MatchDetailsType;
}

export default function MatchDetails({ match }: Props) {
    return (
        <>
            <Head title={`${match.homeTeam.name} vs ${match.awayTeam.name}`} />

            <div className="mb-5">
                <Link
                    href={matches.url()}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to matches
                </Link>
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
