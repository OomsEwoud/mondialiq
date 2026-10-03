import { Link } from '@inertiajs/react';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { show as matchShow } from '@/routes/matches';
import type { Match } from '@/types/match';

export default function CompetitionFixtureList({
    matches,
    emptyMessage,
}: {
    matches: Match[];
    emptyMessage: string;
}) {
    if (matches.length === 0) {
        return <p className="py-5 text-sm text-[#7f8882]">{emptyMessage}</p>;
    }

    return (
        <ul className="divide-y divide-[#262c29]">
            {matches.map((match) => (
                <li key={match.id}>
                    <Link
                        href={matchShow.url(match.id)}
                        className="grid min-h-16 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 py-3 focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-5"
                    >
                        <span className="text-xs leading-5 text-[#949d97] tabular-nums">
                            <span className="block">{match.date}</span>
                            <span className="block">{match.time}</span>
                        </span>
                        <span className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-3">
                            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#daddd9]">
                                <ImageWithFallback
                                    src={match.homeTeamLogo}
                                    alt=""
                                    className="size-5 shrink-0 object-contain"
                                />
                                <span className="truncate">
                                    {match.homeTeam}
                                </span>
                            </span>
                            <span className="hidden text-xs text-[#737c76] sm:inline">
                                {match.score.fulltime.home !== null &&
                                match.score.fulltime.away !== null
                                    ? `${match.score.fulltime.home} – ${match.score.fulltime.away}`
                                    : '—'}
                            </span>
                            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#daddd9] sm:justify-end">
                                <ImageWithFallback
                                    src={match.awayTeamLogo}
                                    alt=""
                                    className="size-5 shrink-0 object-contain"
                                />
                                <span className="truncate">
                                    {match.awayTeam}
                                </span>
                            </span>
                        </span>
                        <span className="text-right text-xs text-[#949d97] sm:min-w-16">
                            <span className="block sm:hidden">
                                {match.score.fulltime.home !== null &&
                                match.score.fulltime.away !== null
                                    ? `${match.score.fulltime.home} – ${match.score.fulltime.away}`
                                    : match.time}
                            </span>
                            {match.hasAiPrediction && (
                                <span className="hidden text-[#9ecbad] sm:inline">
                                    AI-analyse
                                </span>
                            )}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
