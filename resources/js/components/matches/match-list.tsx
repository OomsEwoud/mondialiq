import MatchRow from '@/components/matches/match-row';
import { useLiveFixturesPolling } from '@/hooks/use-live-fixtures-polling';
import type { Match } from '@/types/match';
import { applyLiveFixtureToMatch } from '@/utils/live-fixtures';
import { getMatchStatusKind } from '@/utils/match-status';

interface Props {
    matches: Match[];
    onClear: () => void;
}

export default function MatchList({ matches, onClear }: Props) {
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
            <div className="flex min-h-44 flex-col items-center justify-center border-y border-[#262c29] py-6 text-center">
                <h2 className="text-base font-semibold text-[#f3f4f1]">
                    Geen wedstrijden gevonden
                </h2>
                <p className="mt-2 text-sm text-[#949d97]">
                    Er zijn geen wedstrijden die overeenkomen met je filters.
                </p>
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-2 min-h-11 rounded-sm text-sm font-semibold text-[#9ecbad] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                >
                    Filters wissen
                </button>
            </div>
        );
    }

    const groups = Map.groupBy(visibleMatches, (match) => match.dateValue);

    return (
        <div className="space-y-10 sm:space-y-12">
            {Array.from(groups, ([date, dayMatches]) => (
                <section key={date} aria-labelledby={`match-date-${date}`}>
                    <h2
                        id={`match-date-${date}`}
                        className="mb-4 text-xs font-semibold tracking-[0.12em] text-[#949d97] uppercase"
                    >
                        <time dateTime={date}>
                            {new Intl.DateTimeFormat('nl-BE', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            }).format(new Date(`${date}T00:00:00`))}
                        </time>
                    </h2>
                    <div className="divide-y divide-[#262c29] border-y border-[#262c29]">
                        {dayMatches.map((match) => (
                            <MatchRow key={match.id} match={match} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
