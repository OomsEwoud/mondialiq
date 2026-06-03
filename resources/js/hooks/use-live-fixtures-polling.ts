import { useEffect, useState } from 'react';

import { liveFixtures as liveFixturesRoute } from '@/routes/api';
import type { LiveFixture, LiveFixturesResponse } from '@/types/live-fixture';

interface UseLiveFixturesPollingResult {
    matches: LiveFixture[];
    lastUpdatedAt: string | null;
    hasPollingError: boolean;
}

export function useLiveFixturesPolling(
    initialMatches: LiveFixture[],
): UseLiveFixturesPollingResult {
    const [matches, setMatches] = useState(initialMatches);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(
        latestUpdatedAt(initialMatches),
    );
    const [hasPollingError, setHasPollingError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchLiveFixtures = async () => {
            try {
                const response = await fetch(liveFixturesRoute.url(), {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Live fixtures request failed.');
                }

                const payload = (await response.json()) as LiveFixturesResponse;

                setMatches(payload.data);
                setLastUpdatedAt(latestUpdatedAt(payload.data));
                setHasPollingError(false);
            } catch {
                if (!controller.signal.aborted) {
                    setHasPollingError(true);
                }
            }
        };

        void fetchLiveFixtures();

        const interval = window.setInterval(() => {
            void fetchLiveFixtures();
        }, 60000);

        return () => {
            controller.abort();
            window.clearInterval(interval);
        };
    }, []);

    return {
        matches,
        lastUpdatedAt,
        hasPollingError,
    };
}

function latestUpdatedAt(matches: LiveFixture[]) {
    return (
        matches
            .map((match) => match.updated_at)
            .filter((updatedAt): updatedAt is string => updatedAt !== null)
            .sort()
            .at(-1) ?? null
    );
}
