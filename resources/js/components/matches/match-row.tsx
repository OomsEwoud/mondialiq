import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import MatchAiAnalysis from '@/components/matches/match-ai-analysis';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { cn } from '@/lib/utils';
import { show as showMatch } from '@/routes/matches';
import type { Match } from '@/types/match';
import { formatMatchCompetition } from '@/utils/match-competition';
import {
    getDisplayMatchScore,
    getMatchStatusKind,
    shouldShowMatchScore,
} from '@/utils/match-status';

export default function MatchRow({ match }: { match: Match }) {
    const kind = getMatchStatusKind(match);
    const score = getDisplayMatchScore(match);
    const showScore = shouldShowMatchScore(match);
    const status = {
        upcoming: 'Nog niet gestart',
        live: `Live${match.elapsedTime !== null ? ` ${match.elapsedTime}′` : ''}`,
        finished: 'FT',
        postponed: 'Uitgesteld',
        cancelled: 'Afgelast',
        unknown: 'Tijd volgt',
    }[kind];
    const teams = [
        { name: match.homeTeam, logo: match.homeTeamLogo, score: score.home },
        { name: match.awayTeam, logo: match.awayTeamLogo, score: score.away },
    ];

    return (
        <article>
            <Link
                href={showMatch(match.id)}
                className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 rounded-xl border border-[#262e28] bg-[#111513] p-4 transition-colors hover:border-[#425047] hover:bg-[#171d19] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:gap-x-5 lg:grid-cols-[4.5rem_minmax(0,1fr)_minmax(13rem,0.8fr)_auto] lg:px-5"
            >
                <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:row-span-2 sm:block">
                    <time
                        dateTime={match.kickoffAt}
                        className="text-sm font-semibold text-foreground tabular-nums"
                    >
                        {match.time}
                    </time>
                    <span
                        className={cn(
                            'text-xs sm:mt-1 sm:block',
                            kind === 'live'
                                ? 'font-semibold text-primary'
                                : 'text-muted-foreground',
                        )}
                    >
                        {status}
                    </span>
                </div>
                <div className="grid min-w-0 gap-2 sm:col-start-2">
                    {teams.map((team, index) => (
                        <div
                            key={index}
                            className="flex max-w-sm min-w-0 items-center gap-2.5"
                        >
                            <ImageWithFallback
                                src={team.logo}
                                alt=""
                                loading="lazy"
                                className="size-6 shrink-0 object-contain"
                            />
                            <span className="min-w-0 flex-1 text-sm font-semibold text-foreground sm:text-base">
                                {team.name}
                            </span>
                            {showScore && (
                                <span className="w-6 shrink-0 text-right text-base font-semibold text-foreground tabular-nums">
                                    {team.score ?? '–'}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="col-span-2 border-t border-border/40 pt-3 sm:col-span-1 sm:col-start-2 sm:row-start-3 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:border-t-0 lg:border-l lg:py-0 lg:pl-5">
                    <MatchAiAnalysis match={match} />
                </div>
                <p className="col-span-2 text-xs text-muted-foreground sm:col-span-1 sm:col-start-2 sm:row-start-2">
                    {formatMatchCompetition(match)}
                </p>
                <ChevronRight
                    aria-hidden="true"
                    className="col-start-2 row-start-2 size-4 text-muted-foreground transition-colors group-hover:text-foreground sm:col-start-3 sm:row-span-2 sm:row-start-1 lg:col-start-4"
                />
            </Link>
        </article>
    );
}
