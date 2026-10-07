import { Link } from '@inertiajs/react';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';

import { show as showMatch } from '@/routes/matches';
import type { Match } from '@/types/match';

export default function MatchList({ matches }: { matches: Match[] }) {
    return (
        <div className="divide-y divide-border-subtle border-y border-border-subtle">
            {matches.map((match) => (
                <Link
                    key={match.id}
                    href={showMatch(match.id)}
                    className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 py-5 transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[4.5rem_1fr_auto]"
                >
                    <div>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                            {match.time}
                        </span>
                        <span className="mt-1 block max-w-16 truncate text-[0.6rem] font-semibold tracking-[0.06em] text-text-muted uppercase">
                            {match.leagueName ?? match.round}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <TeamLogo
                                src={match.homeTeamLogo}
                                name={match.homeTeam}
                            />
                            <span className="truncate text-sm font-semibold text-foreground">
                                {match.homeTeam}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <TeamLogo
                                src={match.awayTeamLogo}
                                name={match.awayTeam}
                            />
                            <span className="truncate text-sm font-semibold text-foreground">
                                {match.awayTeam}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[0.65rem] font-semibold tracking-[0.1em] text-text-muted uppercase">
                            AI voorspelling
                        </span>
                        <strong className="mt-1 block text-xl font-black text-foreground tabular-nums">
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
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-crest-surface p-1">
            <ImageWithFallback
                src={src}
                alt=""
                className="size-full object-contain"
            />
            <span className="sr-only">{name}</span>
        </span>
    );
}
function score(value?: number | null) {
    return value === null || value === undefined ? '—' : Math.round(value);
}
