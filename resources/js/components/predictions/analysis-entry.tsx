import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import AnalysisProbabilities from '@/components/predictions/analysis-probabilities';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { cn } from '@/lib/utils';
import { show as showAnalysis } from '@/routes/predictions/ai';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';
import {
    cleanAiAdvice,
    formatAiConfidence,
    getActualScoreLabel,
    isFinishedFixture,
} from '@/utils/ai-prediction';
import { getMatchStatusKind } from '@/utils/match-status';

export default function AnalysisEntry({
    match,
    showDate = false,
}: {
    match: Match;
    showDate?: boolean;
}) {
    const prediction = match.aiPrediction;
    const advice = cleanAiAdvice(prediction?.advice);
    const kind = getMatchStatusKind(match);
    const teams = [
        {
            id: match.homeTeamId,
            name: match.homeTeam,
            logo: match.homeTeamLogo,
        },
        {
            id: match.awayTeamId,
            name: match.awayTeam,
            logo: match.awayTeamLogo,
        },
    ];
    const hasScore =
        prediction?.homeScore != null && prediction?.awayScore != null;

    return (
        <article
            aria-labelledby={`analysis-${match.id}`}
            className="py-7 sm:py-9"
        >
            <h3 id={`analysis-${match.id}`} className="sr-only">
                {match.homeTeam} – {match.awayTeam}
            </h3>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <p>
                    {match.leagueName ?? match.round}
                    <span aria-hidden="true"> · </span>
                    <time dateTime={match.kickoffAt}>
                        {showDate && `${match.date} · `}
                        {match.time}
                    </time>
                </p>
                {kind === 'live' ? (
                    <span className="inline-flex items-center gap-1.5 text-positive">
                        <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full bg-primary"
                        />
                        Live
                        {match.elapsedTime !== null
                            ? ` ${match.elapsedTime}′`
                            : ''}
                    </span>
                ) : isFinishedFixture(match) ? (
                    <span>Afgelopen · {getActualScoreLabel(match)}</span>
                ) : kind === 'postponed' ? (
                    <span>Uitgesteld</span>
                ) : kind === 'cancelled' ? (
                    <span>Afgelast</span>
                ) : (
                    <span>Analyse vóór aftrap</span>
                )}
            </div>
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
                <div className="min-w-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-5">
                        {teams.map((team, index) => (
                            <Link
                                key={team.id}
                                href={showTeam(team.id)}
                                className={cn(
                                    'flex min-w-0 flex-col items-center gap-3 rounded-sm text-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                    index === 1 && 'col-start-3 row-start-1',
                                )}
                            >
                                <span className="flex size-11 items-center justify-center rounded-lg bg-crest-surface p-2 sm:size-12">
                                    <ImageWithFallback
                                        src={team.logo}
                                        alt=""
                                        loading="lazy"
                                        className="size-full object-contain"
                                    />
                                </span>
                                <span className="text-sm leading-5 font-semibold break-words text-foreground hover:text-foreground sm:text-base">
                                    {team.name}
                                </span>
                            </Link>
                        ))}
                        <div className="col-start-2 row-start-1 text-center">
                            <p className="text-3xl font-black tracking-[-0.05em] whitespace-nowrap text-foreground tabular-nums sm:text-4xl">
                                {hasScore
                                    ? `${Math.round(prediction.homeScore!)} – ${Math.round(prediction.awayScore!)}`
                                    : '—'}
                            </p>
                            <p className="mt-2 max-w-24 text-xs leading-4 text-muted-foreground">
                                {hasScore
                                    ? 'Verwachte uitslag'
                                    : 'Uitslag nog onbekend'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-7">
                        <AnalysisProbabilities match={match} />
                    </div>
                </div>
                <div className="flex min-w-0 flex-col items-start border-t border-border-subtle pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                    <div className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                        <p className="text-xs font-semibold tracking-[0.1em] text-positive uppercase">
                            Waarom deze voorspelling?
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Confidence{' '}
                            <span className="font-semibold text-foreground tabular-nums">
                                {prediction?.confidence
                                    ? formatAiConfidence(prediction.confidence)
                                          .value
                                    : 'onbekend'}
                            </span>
                        </p>
                    </div>
                    <p className="mt-4 line-clamp-4 text-sm leading-7 break-words text-text-secondary">
                        {advice ??
                            'Er is nog geen toelichting beschikbaar voor deze voorspelling.'}
                    </p>
                    <Link
                        href={showAnalysis(match.id)}
                        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-positive transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        Bekijk volledige analyse{' '}
                        <ArrowRight className="size-4" aria-hidden="true" />
                        <span className="sr-only">
                            : {match.homeTeam} – {match.awayTeam}
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    );
}
