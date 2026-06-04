import type { LiveFixture } from '@/types/live-fixture';
import type { Match } from '@/types/match';

export function applyLiveFixtureToMatch(
    match: Match,
    liveFixture: LiveFixture | undefined,
): Match {
    if (liveFixture === undefined) {
        return match;
    }

    return {
        ...match,
        status:
            liveFixture.status_long ?? liveFixture.status_short ?? match.status,
        elapsedTime: liveFixture.elapsed_time ?? match.elapsedTime,
        score: {
            ...match.score,
            fulltime: {
                home: liveFixture.home_goals ?? match.score.fulltime.home,
                away: liveFixture.away_goals ?? match.score.fulltime.away,
            },
        },
    };
}
