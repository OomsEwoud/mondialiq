import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { useLiveFixturesPolling } from '@/hooks/use-live-fixtures-polling';
import { show as showMatch } from '@/routes/matches';
import type { LiveFixture } from '@/types/live-fixture';
import { getLiveStatusLabel } from '@/utils/match-status';

interface Props {
    initialMatches: LiveFixture[];
}

export default function LiveMatches({ initialMatches }: Props) {
    const { matches, lastUpdatedAt, hasPollingError } = useLiveFixturesPolling(
        initialMatches,
        {
            enabled: initialMatches.length > 0,
        },
    );
    const visibleMatches = matches;

    return (
        <section className="rounded-2xl border border-emerald-200/60 bg-gradient-to-b from-white to-emerald-50/30 p-4 shadow-sm">
            <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">
                        Match center
                    </p>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Live now
                    </h2>
                </div>
                <div className="text-right text-xs font-semibold text-slate-600">
                    {lastUpdatedAt && (
                        <p>Updated {formatUpdatedTime(lastUpdatedAt)}</p>
                    )}
                    {hasPollingError && <p>Using latest data</p>}
                </div>
            </header>
            <div className="flex flex-col gap-3">
                {visibleMatches.length > 0 ? (
                    visibleMatches.map((match) => (
                        <div
                            key={match.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <TeamLabel team={match.home_team} />
                                <div className="text-center">
                                    <p className="text-xl font-semibold text-slate-900 tabular-nums">
                                        {scoreLabel(match.home_goals)} -{' '}
                                        {scoreLabel(match.away_goals)}
                                    </p>
                                    <p className="mt-1 inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                        {minuteLabel(match)}
                                    </p>
                                </div>
                                <TeamLabel
                                    team={match.away_team}
                                    align="right"
                                />
                            </div>
                            <div className="mt-3 flex justify-end border-t border-slate-200 pt-2">
                                <Link
                                    href={showMatch.url(match.id)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                    Match details
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <svg
                                className="size-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </span>
                        <p className="mt-3 text-sm font-semibold text-slate-500">
                            No live matches right now.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

function TeamLabel({
    team,
    align = 'left',
}: {
    team: LiveFixture['home_team'];
    align?: 'left' | 'right';
}) {
    const label = team.code ?? team.name ?? 'TBD';

    return (
        <div
            className={`flex min-w-0 items-center gap-2 ${align === 'right' ? 'justify-end text-right' : ''}`}
        >
            {align === 'left' && <TeamLogo team={team} />}
            <span className="min-w-0 truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                {label}
            </span>
            {align === 'right' && <TeamLogo team={team} />}
        </div>
    );
}

function TeamLogo({ team }: { team: LiveFixture['home_team'] }) {
    if (!team.logo_url) {
        return null;
    }

    return (
        <img
            src={team.logo_url}
            alt={team.name ?? team.code ?? 'Team'}
            className="h-7 w-7 shrink-0 rounded-full bg-white object-contain ring-1 ring-slate-200"
        />
    );
}

function scoreLabel(score: number | null) {
    return score ?? '-';
}

function minuteLabel(match: LiveFixture) {
    return getLiveStatusLabel(
        match.status_long,
        match.status_short,
        match.elapsed_time,
    );
}

function formatUpdatedTime(updatedAt: string) {
    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(updatedAt));
}
