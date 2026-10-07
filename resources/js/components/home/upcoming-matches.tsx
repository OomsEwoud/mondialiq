import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarClock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';

import { matches as matchesRoute } from '@/routes';
import { show as showMatch } from '@/routes/matches';
import type { UpcomingMatch } from '@/types/match';

interface Props {
    matches: UpcomingMatch[];
}

const brusselsDateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Brussels',
    year: 'numeric',
});
const kickoffDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'short',
    timeZone: 'Europe/Brussels',
});

export default function UpcomingMatches({ matches }: Props) {
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const visibleMatches = useMemo(
        () =>
            matches.filter((match) =>
                isVisibleUpcomingMatch(match, currentTime),
            ),
        [matches, currentTime],
    );
    const hasMatches = visibleMatches.length > 0;

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    return (
        <section className="rounded-2xl border border-primary/25 bg-gradient-to-b from-card to-accent/30 p-4 shadow-sm">
            <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                        Schedule
                    </p>
                    <h2 className="text-base font-semibold text-foreground">
                        Upcoming matches
                    </h2>
                </div>
            </header>

            {hasMatches ? (
                <div className="flex flex-col gap-3">
                    {visibleMatches.map((match) => (
                        <article
                            key={match.id}
                            className="rounded-lg border border-primary/25 bg-gradient-to-b from-accent/60 to-card p-3 transition-shadow hover:shadow-sm"
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                                    Matchday
                                </span>
                                <div className="flex flex-wrap justify-end gap-1.5">
                                    <span className="rounded-full border border-primary/25 bg-brand-subtle px-2.5 py-1 text-xs font-semibold text-foreground">
                                        {formatKickoffDateTime(match.kickoffAt)}
                                    </span>
                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                        {kickoffCountdown(
                                            match.kickoffAt,
                                            currentTime,
                                        )}
                                    </span>
                                    {match.hasLineups ? (
                                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                            Lineup available
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <ImageWithFallback
                                        src={match.homeTeamLogo}
                                        alt={match.homeTeam}
                                        className="h-8 w-8 shrink-0 rounded-full bg-card object-contain ring-1 ring-border-subtle"
                                    />
                                    <span className="min-w-0 truncate rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground">
                                        {match.homeTeamShort}
                                    </span>
                                </div>
                                <span className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-border-subtle">
                                    vs
                                </span>
                                <div className="flex min-w-0 flex-row-reverse items-center gap-2 text-right">
                                    <ImageWithFallback
                                        src={match.awayTeamLogo}
                                        alt={match.awayTeam}
                                        className="h-8 w-8 shrink-0 rounded-full bg-card object-contain ring-1 ring-border-subtle"
                                    />
                                    <span className="min-w-0 truncate rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground">
                                        {match.awayTeamShort}
                                    </span>
                                </div>
                            </div>

                            {match.predictionState ? (
                                <div
                                    className={
                                        match.predictionState === 'predicted'
                                            ? 'mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold tracking-wide text-emerald-800 uppercase'
                                            : 'mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold tracking-wide text-amber-800 uppercase'
                                    }
                                >
                                    {match.predictionState === 'predicted'
                                        ? 'Prediction saved'
                                        : 'Prediction missing'}
                                </div>
                            ) : null}

                            <div className="mt-3 border-t border-border pt-2">
                                <Link
                                    href={showMatch.url(match.id)}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                    View match details
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-elevated px-4 py-8 text-center">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-brand-subtle text-muted-foreground">
                        <CalendarClock className="size-5" />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">
                        No upcoming matches right now
                    </h3>
                    <p className="mt-1 max-w-sm text-sm leading-6 font-medium text-muted-foreground">
                        The schedule is clear for the moment. Check all matches
                        to review fixtures, results and predictions.
                    </p>
                    <Link
                        href={matchesRoute.url()}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        View all matches
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            )}
        </section>
    );
}

function isVisibleUpcomingMatch(match: UpcomingMatch, currentTime: Date) {
    const kickoffAt = new Date(match.kickoffAt);

    if (Number.isNaN(kickoffAt.getTime()) || kickoffAt <= currentTime) {
        return false;
    }

    if (hasUnavailableStatusLong(match.statusLong)) {
        return false;
    }

    if (match.statusShort !== null) {
        return match.statusShort === 'NS';
    }

    return match.statusLong === 'Not Started';
}

function hasUnavailableStatusLong(statusLong: string | null) {
    if (statusLong === null) {
        return false;
    }

    const normalizedStatus = statusLong.toLowerCase();

    return [
        'abandon',
        'award',
        'cancel',
        'finished',
        'forfeit',
        'interrupt',
        'postpon',
        'suspend',
        'walk',
    ].some((status) => normalizedStatus.includes(status));
}

function kickoffCountdown(kickoffAt: string, currentTime: Date) {
    const kickoffDate = new Date(kickoffAt);
    const diffInMinutes = Math.ceil(
        (kickoffDate.getTime() - currentTime.getTime()) / 60000,
    );

    if (diffInMinutes <= 0) {
        return 'Kickoff now';
    }

    if (diffInMinutes < 60) {
        return `Kickoff in ${diffInMinutes} min`;
    }

    if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;

        return minutes > 0
            ? `Kickoff in ${hours}h ${minutes}m`
            : `Kickoff in ${hours}h`;
    }

    if (isTomorrow(kickoffDate, currentTime)) {
        return 'Kickoff tomorrow';
    }

    const days = Math.ceil(diffInMinutes / (24 * 60));

    return `Kickoff in ${days}d`;
}

function isTomorrow(date: Date, currentTime: Date) {
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(currentTime.getDate() + 1);

    return (
        brusselsDateKeyFormatter.format(date) ===
        brusselsDateKeyFormatter.format(tomorrow)
    );
}

function formatKickoffDateTime(kickoffAt: string) {
    return kickoffDateTimeFormatter.format(new Date(kickoffAt));
}
