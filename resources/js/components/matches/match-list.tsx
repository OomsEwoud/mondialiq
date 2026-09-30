import { SearchX } from 'lucide-react';
import MatchCard from '@/components/matches/match-card';
import { useLiveFixturesPolling } from '@/hooks/use-live-fixtures-polling';
import type { Match } from '@/types/match';
import { applyLiveFixtureToMatch } from '@/utils/live-fixtures';
import { getMatchStatusKind } from '@/utils/match-status';

interface Props {
    matches: Match[];
}

export default function MatchList({ matches }: Props) {
    const shouldPollLiveFixtures = matches.some(
        (match) => getMatchStatusKind(match) === 'live',
    );
    const { matches: liveMatches } = useLiveFixturesPolling([], {
        enabled: shouldPollLiveFixtures,
    });
    const visibleMatches = matches.map((match) =>
        applyLiveFixtureToMatch(
            match,
            liveMatches.find((liveMatch) => liveMatch.id === match.id),
        ),
    );

    if (visibleMatches.length === 0) {
        return (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-[#343d37] bg-[#101412] px-5 py-14 text-center">
                <span className="flex size-11 items-center justify-center rounded-md bg-[#1a211d] text-[#70b98e]">
                    <SearchX className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#f3f4f1]">
                    Geen wedstrijden gevonden
                </h3>
                <p className="mt-2 text-sm text-[#89928c]">
                    Pas je filters aan of probeer het later opnieuw.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {visibleMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
            ))}
        </div>
    );
}
