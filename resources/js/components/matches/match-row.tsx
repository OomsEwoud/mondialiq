import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import MatchDetailsPanel from '@/components/matches/match-details-panel';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { cn } from '@/lib/utils';
import { show as showMatch } from '@/routes/matches';
import type { Match } from '@/types/match';
import { formatAiConfidence } from '@/utils/ai-prediction';
import {
    getDisplayMatchScore,
    getMatchStatusKind,
    shouldShowMatchScore,
} from '@/utils/match-status';

export default function MatchRow({ match }: { match: Match }) {
    const [showDetails, setShowDetails] = useState(false);
    const kind = getMatchStatusKind(match);
    const score = getDisplayMatchScore(match);
    const showScore = shouldShowMatchScore(match);
    const status = {
        upcoming: 'Binnenkort',
        live: `Live${match.elapsedTime !== null ? ` ${match.elapsedTime}′` : ''}`,
        finished: 'Afgelopen',
        postponed: 'Uitgesteld',
        cancelled: 'Afgelast',
        unknown: 'Tijd volgt',
    }[kind];
    const teams = [
        { name: match.homeTeam, logo: match.homeTeamLogo, score: score.home },
        { name: match.awayTeam, logo: match.awayTeamLogo, score: score.away },
    ];

    return (
        <article className="py-5 sm:py-6">
            <Link
                href={showMatch(match.id)}
                className="group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-x-6 lg:grid-cols-[6rem_minmax(0,1fr)_minmax(12rem,0.8fr)_auto]"
            >
                <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 sm:col-span-1 sm:block">
                    <time
                        dateTime={match.kickoffAt}
                        className="text-sm font-semibold text-[#daddd9] tabular-nums"
                    >
                        {match.time}
                    </time>
                    <span
                        className={cn(
                            'flex items-center gap-1.5 text-xs sm:mt-2',
                            kind === 'live'
                                ? 'font-semibold text-[#9ecbad]'
                                : 'text-[#949d97]',
                        )}
                    >
                        {kind === 'live' && (
                            <span
                                aria-hidden="true"
                                className="size-1.5 rounded-full bg-[#6fae88]"
                            />
                        )}
                        {status}
                    </span>
                </div>
                <div className="grid min-w-0 gap-3">
                    {teams.map((team, index) => (
                        <div
                            key={index}
                            className="flex min-w-0 items-center gap-3"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#f3f4f1] p-1.5">
                                <ImageWithFallback
                                    src={team.logo}
                                    alt=""
                                    loading="lazy"
                                    className="size-full object-contain"
                                />
                            </span>
                            <span className="min-w-0 flex-1 text-sm leading-5 font-semibold break-words text-[#daddd9] transition-colors group-hover:text-white sm:text-base">
                                {team.name}
                            </span>
                            <span
                                className={cn(
                                    'w-6 shrink-0 text-right text-lg font-bold tabular-nums',
                                    showScore ? 'text-white' : 'text-[#68706b]',
                                )}
                            >
                                {showScore ? (team.score ?? '—') : '—'}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="col-span-2 row-start-3 min-w-0 text-xs leading-5 sm:col-span-1 sm:col-start-2 sm:row-start-2 lg:col-start-3 lg:row-start-1">
                    <p className="text-[#949d97]">
                        {match.leagueName
                            ? `${match.leagueName} · ${match.round}`
                            : match.round}
                    </p>
                    <p
                        className={cn(
                            'mt-1',
                            match.hasAiPrediction
                                ? 'text-[#9ecbad]'
                                : 'text-[#949d97]',
                        )}
                    >
                        {match.hasAiPrediction
                            ? 'Analyse beschikbaar'
                            : 'Analyse volgt'}
                        {match.hasAiPrediction &&
                            match.aiPrediction?.confidence && (
                                <span className="text-[#949d97]">
                                    {' '}
                                    ·{' '}
                                    {
                                        formatAiConfidence(
                                            match.aiPrediction.confidence,
                                        ).value
                                    }{' '}
                                    confidence
                                </span>
                            )}
                    </p>
                    {match.userPrediction && (
                        <p className="mt-1 text-[#949d97]">
                            Jouw keuze:{' '}
                            <span className="text-[#daddd9]">
                                {match.userPrediction.label}
                            </span>
                        </p>
                    )}
                </div>
                <ArrowRight
                    aria-hidden="true"
                    className="col-start-2 row-start-2 size-4 text-[#949d97] transition-colors group-hover:text-[#9ecbad] sm:col-start-3 sm:row-start-1 lg:col-start-4"
                />
            </Link>
            <div className="mt-2 flex justify-end">
                <button
                    type="button"
                    aria-expanded={showDetails}
                    aria-controls={`match-details-${match.id}`}
                    onClick={() => setShowDetails((current) => !current)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-xs font-medium text-[#949d97] transition-colors hover:text-[#9ecbad] focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                >
                    Details en voorspellen
                    <span className="sr-only">
                        : {match.homeTeam} – {match.awayTeam}
                    </span>
                    <ChevronDown
                        aria-hidden="true"
                        className={cn(
                            'size-3.5 transition-transform',
                            showDetails && 'rotate-180',
                        )}
                    />
                </button>
            </div>
            <div id={`match-details-${match.id}`} hidden={!showDetails}>
                {showDetails && <MatchDetailsPanel match={match} />}
            </div>
        </article>
    );
}
