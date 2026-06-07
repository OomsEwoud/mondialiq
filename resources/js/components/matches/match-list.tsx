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
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 py-14 text-center shadow-sm">
                <span className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <SearchX className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                    No matches found
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                    Try changing your filters or check back later.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {visibleMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
            ))}
        </div>
    );
}
