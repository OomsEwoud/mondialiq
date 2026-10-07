import MatchDetailsTeamBlock from '@/components/matches/details/match-details-team-block';
import type { LiveFixture } from '@/types/live-fixture';
import type { MatchDetails } from '@/types/match-details';
import { translateMatchStatus } from '@/utils/match-status';

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
            className="relative overflow-hidden rounded-xl bg-gradient-to-b from-card/75 to-transparent px-2 py-5 sm:px-6 sm:py-7"
        >
            <div className="mb-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm sm:mb-7">
                <p className="font-semibold text-foreground">{match.round}</p>
                <span aria-hidden="true" className="text-muted-foreground/50">
                    ·
                </span>
                <p className="text-muted-foreground">{match.date}</p>
                <span aria-hidden="true" className="text-muted-foreground/50">
                    ·
                </span>
                <p className="text-muted-foreground">{match.time}</p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-8">
                <MatchDetailsTeamBlock
                    id={match.homeTeam.id}
                    logo={match.homeTeam.logo}
                    name={match.homeTeam.name}
                    code={match.homeTeam.code}
                />
                <div className="flex min-w-24 flex-col items-center gap-2.5 text-center sm:min-w-40">
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
                    <p className="text-4xl font-bold tracking-tight whitespace-nowrap text-foreground tabular-nums sm:text-6xl lg:text-7xl">
                        {scoreLabel}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                        {translateMatchStatus(
                            liveMatch?.status_long ?? match.status,
                        )}
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
