import MatchCard from '@/components/matches/match-card';
import { useLiveFixturesPolling } from '@/hooks/use-live-fixtures-polling';
import type { Match } from '@/types/match';
import { applyLiveFixtureToMatch } from '@/utils/live-fixtures';

interface Props {
    matches: Match[];
}

export default function MatchList({ matches }: Props) {
    const { matches: liveMatches } = useLiveFixturesPolling([]);
    const visibleMatches = matches.map((match) =>
        applyLiveFixtureToMatch(
            match,
            liveMatches.find((liveMatch) => liveMatch.id === match.id),
        ),
    );

    if (visibleMatches.length === 0) {
        return (
            <div className="rounded-[1.75rem] border border-dashed border-cyan-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.88))] py-14 text-center shadow-lg shadow-cyan-950/5">
                <p className="text-sm font-black tracking-[0.12em] text-blue-950 uppercase">
                    No matches found.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                    Try changing your filters.
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
