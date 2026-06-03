import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { useLiveFixturesPolling } from '@/hooks/use-live-fixtures-polling';
import { show as showMatch } from '@/routes/matches';
import type { LiveFixture } from '@/types/live-fixture';

interface Props {
    initialMatches: LiveFixture[];
}

export default function LiveMatches({ initialMatches }: Props) {
    const { matches, lastUpdatedAt, hasPollingError } =
        useLiveFixturesPolling(initialMatches);

    return (
        <section className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm shadow-blue-950/5 backdrop-blur">
            <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-black tracking-widest text-emerald-600 uppercase">
                        Match center
                    </p>
                    <h2 className="flex items-center gap-2 text-base font-black text-slate-950">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Live now
                    </h2>
                </div>
                <div className="text-right text-[11px] font-bold text-slate-400">
                    {lastUpdatedAt && (
                        <p>Updated {formatUpdatedTime(lastUpdatedAt)}</p>
                    )}
                    {hasPollingError && <p>Using latest data</p>}
                </div>
            </header>
            <div className="flex flex-col gap-3">
                {matches.length > 0 ? (
                    matches.map((match) => (
                        <div
                            key={match.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm"
                        >
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <TeamLabel team={match.home_team} />
                                <div className="text-center">
                                    <p className="text-xl font-black text-blue-950 tabular-nums">
                                        {scoreLabel(match.home_goals)} -{' '}
                                        {scoreLabel(match.away_goals)}
                                    </p>
                                    <p className="mt-1 inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-black text-red-700">
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
                                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-blue-950 shadow-sm transition-colors hover:bg-cyan-50 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                    Match details
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-sm font-bold text-slate-500 shadow-sm">
                        No live matches right now.
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
            <span className="min-w-0 truncate rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-700">
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
    const status = readableStatus(match.status_long, match.status_short);

    if (match.elapsed_time !== null) {
        return `${status} ${match.elapsed_time}'`;
    }

    return status;
}

function readableStatus(statusLong: string | null, statusShort: string | null) {
    if (statusLong) {
        return statusLong;
    }

    return (
        {
            '1H': 'First Half',
            HT: 'Half Time',
            '2H': 'Second Half',
            ET: 'Extra Time',
            BT: 'Break Time',
            P: 'Penalties',
            LIVE: 'Live',
        }[statusShort ?? ''] ?? 'Live'
    );
}

function formatUpdatedTime(updatedAt: string) {
    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(updatedAt));
}
