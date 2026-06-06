import { useEffect, useState } from 'react';

import { usePageVisibility } from '@/hooks/use-page-visibility';
import { liveFixtures as liveFixturesRoute } from '@/routes/api';
import type { LiveFixture, LiveFixturesResponse } from '@/types/live-fixture';

const DEFAULT_POLLING_INTERVAL_MS = 60000;

interface UseLiveFixturesPollingOptions {
    enabled?: boolean;
    intervalMs?: number;
}

interface UseLiveFixturesPollingResult {
    matches: LiveFixture[];
    lastUpdatedAt: string | null;
    hasPollingError: boolean;
}

export function useLiveFixturesPolling(
    initialMatches: LiveFixture[],
    options: UseLiveFixturesPollingOptions = {},
): UseLiveFixturesPollingResult {
    const [matches, setMatches] = useState(initialMatches);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(
        latestUpdatedAt(initialMatches),
    );
    const [hasPollingError, setHasPollingError] = useState(false);
    const isPageVisible = usePageVisibility();
    const enabled = options.enabled ?? initialMatches.length > 0;
    const intervalMs = options.intervalMs ?? DEFAULT_POLLING_INTERVAL_MS;

    useEffect(() => {
        if (!enabled || !isPageVisible) {
            return;
        }

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

                setMatches((currentMatches) =>
                    mergeLiveFixtures(currentMatches, payload.data),
                );
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
        }, intervalMs);

        return () => {
            controller.abort();
            window.clearInterval(interval);
        };
    }, [enabled, intervalMs, isPageVisible]);

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

function mergeLiveFixtures(
    currentMatches: LiveFixture[],
    nextMatches: LiveFixture[],
): LiveFixture[] {
    return nextMatches.map((nextMatch) => {
        const currentMatch = currentMatches.find(
            (match) => match.id === nextMatch.id,
        );

        if (currentMatch === undefined) {
            return nextMatch;
        }

        return {
            ...nextMatch,
            home_goals: nextMatch.home_goals ?? currentMatch.home_goals,
            away_goals: nextMatch.away_goals ?? currentMatch.away_goals,
            status_short: nextMatch.status_short ?? currentMatch.status_short,
            status_long: nextMatch.status_long ?? currentMatch.status_long,
            elapsed_time: nextMatch.elapsed_time ?? currentMatch.elapsed_time,
        };
    });
}
