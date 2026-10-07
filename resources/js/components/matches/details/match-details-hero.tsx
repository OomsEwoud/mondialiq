import MatchDetailsTeamBlock from '@/components/matches/details/match-details-team-block';
import type { LiveFixture } from '@/types/live-fixture';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
    liveMatch?: LiveFixture;
    lastUpdatedAt: string | null;
    hasPollingError: boolean;
}

export default function MatchDetailsHero({
    match,
    liveMatch,
    lastUpdatedAt,
    hasPollingError,
}: Props) {
    const score = liveMatch
        ? {
              home: liveMatch.home_goals ?? match.score.fulltime.home,
              away: liveMatch.away_goals ?? match.score.fulltime.away,
          }
        : match.score.fulltime;
    const hasScore = score.home !== null && score.away !== null;
    const scoreLabel = hasScore ? `${score.home} - ${score.away}` : 'vs';
    const isLive = liveMatch !== undefined || isLiveStatus(match.status);

    return (
        <section
            aria-label="Scorebord"
            className="overflow-hidden rounded-lg border border-border bg-card"
        >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3 sm:px-6">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    {match.round}
                </p>
                <p className="text-xs text-muted-foreground">
                    {match.date} · {match.time}
                </p>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-6 sm:gap-6 sm:px-8 sm:py-9">
                <MatchDetailsTeamBlock
                    id={match.homeTeam.id}
                    logo={match.homeTeam.logo}
                    name={match.homeTeam.name}
                    code={match.homeTeam.code}
                />
                <div className="flex max-w-28 flex-col items-center gap-2 text-center sm:max-w-44">
                    {isLive && (
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                                </span>
                                Live
                            </span>
                        </div>
                    )}
                    <p className="text-4xl font-semibold tracking-tight whitespace-nowrap text-foreground tabular-nums sm:text-6xl">
                        {scoreLabel}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                        {liveMatch?.status_long ?? match.status}
                    </p>
                    {isLive && (lastUpdatedAt || hasPollingError) && (
                        <p className="mt-2 text-xs font-semibold tracking-wide text-muted-foreground">
                            {lastUpdatedAt &&
                                `Bijgewerkt ${formatUpdatedTime(lastUpdatedAt)}`}
                            {hasPollingError &&
                                `${lastUpdatedAt ? ' · ' : ''}laatst bekende stand`}
                        </p>
                    )}
                </div>
                <MatchDetailsTeamBlock
                    id={match.awayTeam.id}
                    logo={match.awayTeam.logo}
                    name={match.awayTeam.name}
                    code={match.awayTeam.code}
                    align="right"
                />
            </div>
        </section>
    );
}

function isLiveStatus(status: string) {
    const normalizedStatus = status.toLowerCase();
    const liveStatusCodes = ['1h', 'ht', '2h', 'et', 'bt', 'p', 'live'];

    return (
        liveStatusCodes.includes(normalizedStatus) ||
        [
            'live',
            'first half',
            'halftime',
            'second half',
            'extra time',
            'break time',
            'penalty',
            'in progress',
            'suspended',
            'interrupted',
        ].some((liveStatus) => normalizedStatus.includes(liveStatus))
    );
}

function formatUpdatedTime(updatedAt: string) {
    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(updatedAt));
}
