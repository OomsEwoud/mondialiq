import MatchDetailsTeamBlock from '@/components/matches/details/match-details-team-block';
import type { LiveFixture } from '@/types/live-fixture';
import type { MatchDetails } from '@/types/match-details';
import { getLiveStatusLabel } from '@/utils/match-status';

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
    const statusLabel = liveMatch
        ? getLiveStatusLabel(
              liveMatch.status_long ?? match.status,
              liveMatch.status_short,
              liveMatch.elapsed_time ?? match.elapsedTime,
          )
        : getLiveStatusLabel(match.status, null, match.elapsedTime);

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-cyan-50/40 p-5 shadow-sm sm:p-6 lg:p-7">
            <p className="mb-5 text-center text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                {match.round}
            </p>

            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
                <MatchDetailsTeamBlock
                    id={match.homeTeam.id}
                    logo={match.homeTeam.logo}
                    name={match.homeTeam.name}
                    code={match.homeTeam.code}
                />
                <div className="text-center">
                    {isLive && (
                        <div className="mb-3 flex justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold tracking-wide text-red-700 uppercase">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                                </span>
                                Live provisional score
                            </span>
                        </div>
                    )}
                    <p className="text-3xl font-semibold text-slate-900 tabular-nums sm:text-4xl">
                        {scoreLabel}
                    </p>
                    <p className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                        {statusLabel}
                    </p>
                    {isLive && (lastUpdatedAt || hasPollingError) && (
                        <p className="mt-2 text-xs font-semibold tracking-wide text-slate-600">
                            {lastUpdatedAt &&
                                `Updated ${formatUpdatedTime(lastUpdatedAt)}`}
                            {hasPollingError &&
                                `${lastUpdatedAt ? ' · ' : ''}using latest data`}
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
