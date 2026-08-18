import { Link } from '@inertiajs/react';

import { show as showMatch } from '@/routes/matches';
import type { LiveFixture } from '@/types/live-fixture';
import { getLiveStatusLabel } from '@/utils/match-status';

export default function LivePanel({
    matches,
    className,
}: {
    matches: LiveFixture[];
    className?: string;
}) {
    return (
        <section className={className}>
            <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#57ad78]" />
                <h2 className="text-xl font-bold text-white">Live</h2>
            </div>
            {matches.length === 0 ? (
                <p className="mt-5 text-sm text-[#7f8882]">
                    Geen wedstrijden live op dit moment. Zodra een match begint,
                    verschijnt de score hier automatisch.
                </p>
            ) : (
                <div className="mt-5 divide-y divide-[#262c29] border-y border-[#262c29]">
                    {matches.map((match) => (
                        <Link
                            key={match.id}
                            href={showMatch(match.id)}
                            className="block py-4 transition hover:bg-[#111513] focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:outline-none focus-visible:ring-inset"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="truncate text-xs font-medium text-[#7f8882]">
                                    {match.league?.name ?? 'Live wedstrijd'}
                                </span>
                                <span className="shrink-0 text-xs font-semibold text-[#6fae88]">
                                    {getLiveStatusLabel(
                                        match.status_long,
                                        match.status_short,
                                        match.elapsed_time,
                                    )}
                                </span>
                            </div>
                            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <LiveTeam team={match.home_team} />
                                <strong className="text-2xl font-black text-white tabular-nums">
                                    {match.home_goals ?? '—'}–
                                    {match.away_goals ?? '—'}
                                </strong>
                                <LiveTeam team={match.away_team} away />
                            </div>
                            {match.ai_prediction && (
                                <p className="mt-4 text-xs text-[#7f8882]">
                                    AI voorspelling vóór aftrap:{' '}
                                    <strong className="text-[#b5bbb7] tabular-nums">
                                        {score(match.ai_prediction.home_goals)}–
                                        {score(match.ai_prediction.away_goals)}
                                    </strong>
                                </p>
                            )}
                            <span className="mt-3 block text-xs font-semibold text-[#9ecbad]">
                                Volg live →
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

function LiveTeam({
    team,
    away = false,
}: {
    team: LiveFixture['home_team'];
    away?: boolean;
}) {
    return (
        <div
            className={`flex min-w-0 items-center gap-2 ${away ? 'flex-row-reverse text-right' : ''}`}
        >
            {team.logo_url && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#f3f4f1] p-1">
                    <img
                        src={team.logo_url}
                        alt=""
                        className="size-full object-contain"
                    />
                </span>
            )}
            <span className="truncate text-sm font-semibold text-[#daddd9]">
                {team.name}
            </span>
        </div>
    );
}

function score(value: number | null) {
    return value === null ? '—' : Math.round(value);
}
