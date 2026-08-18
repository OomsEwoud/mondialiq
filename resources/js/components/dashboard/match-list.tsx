import { Link } from '@inertiajs/react';

import { show as showMatch } from '@/routes/matches';
import type { Match } from '@/types/match';

export default function MatchList({ matches }: { matches: Match[] }) {
    return (
        <div className="divide-y divide-[#262c29] border-y border-[#262c29]">
            {matches.map((match) => (
                <Link
                    key={match.id}
                    href={showMatch(match.id)}
                    className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 py-4 transition hover:bg-[#111513] focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[4.5rem_1fr_auto]"
                >
                    <span className="text-sm font-semibold text-[#949d97] tabular-nums">
                        {match.time}
                    </span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <TeamLogo
                                src={match.homeTeamLogo}
                                name={match.homeTeam}
                            />
                            <span className="truncate text-sm font-semibold text-[#daddd9]">
                                {match.homeTeam}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <TeamLogo
                                src={match.awayTeamLogo}
                                name={match.awayTeam}
                            />
                            <span className="truncate text-sm font-semibold text-[#daddd9]">
                                {match.awayTeam}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[0.65rem] font-semibold tracking-[0.1em] text-[#68706b] uppercase">
                            AI
                        </span>
                        <strong className="mt-1 block text-xl font-black text-white tabular-nums">
                            {score(match.aiPrediction?.homeScore)}–
                            {score(match.aiPrediction?.awayScore)}
                        </strong>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function TeamLogo({ src, name }: { src: string; name: string }) {
    return (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#f3f4f1] p-1">
            <img src={src} alt="" className="size-full object-contain" />
            <span className="sr-only">{name}</span>
        </span>
    );
}
function score(value?: number | null) {
    return value === null || value === undefined ? '—' : Math.round(value);
}
