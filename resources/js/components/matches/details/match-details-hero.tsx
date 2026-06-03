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
              home: liveMatch.home_goals,
              away: liveMatch.away_goals,
          }
        : match.score.fulltime;
    const hasScore = score.home !== null && score.away !== null;
    const scoreLabel = hasScore ? `${score.home} - ${score.away}` : 'vs';
    const isLive = liveMatch !== undefined || isLiveStatus(match.status);
    const statusLabel = liveMatch
        ? liveStatusLabel(
              liveMatch.status_long,
              liveMatch.status_short,
              liveMatch.elapsed_time,
          )
        : liveStatusLabel(match.status, null, match.elapsedTime);

    return (
        <section className="overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.18),transparent_24rem),linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eef7ff_100%)] p-5 shadow-2xl shadow-cyan-950/8 sm:p-6 lg:p-7">
            <p className="mb-5 text-center text-xs font-black tracking-[0.22em] text-cyan-700 uppercase">
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
                            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,1),rgba(254,202,202,0.82))] px-3 py-1 text-[10px] font-black tracking-[0.16em] text-red-700 uppercase shadow-sm shadow-red-950/10">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                                </span>
                                Live provisional score
                            </span>
                        </div>
                    )}
                    <p className="text-3xl font-black text-blue-950 tabular-nums sm:text-4xl">
                        {scoreLabel}
                    </p>
                    <p className="mt-3 inline-flex rounded-full border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(241,245,249,0.92))] px-3 py-1 text-[10px] font-black tracking-[0.16em] text-slate-600 uppercase shadow-sm shadow-cyan-950/5 sm:text-xs">
                        {statusLabel}
                    </p>
                    {isLive && (lastUpdatedAt || hasPollingError) && (
                        <p className="mt-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
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

function liveStatusLabel(
    statusLong: string | null,
    statusShort: string | null,
    elapsedTime: number | null,
) {
    const status = readableStatus(statusLong, statusShort);

    if (elapsedTime !== null) {
        return `${status} ${elapsedTime}'`;
    }

    return status;
}

function readableStatus(statusLong: string | null, statusShort: string | null) {
    if (statusLong) {
        return statusLong;
    }

    return (
        {
            '1H': 'First Half',
            HT: 'Half Time',
            '2H': 'Second Half',
            ET: 'Extra Time',
            BT: 'Break Time',
            P: 'Penalties',
            LIVE: 'Live',
        }[statusShort ?? ''] ?? 'Live'
    );
}

function isLiveStatus(status: string) {
    const normalizedStatus = status.toLowerCase();

    return [
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
    ].some((liveStatus) => normalizedStatus.includes(liveStatus));
}

function formatUpdatedTime(updatedAt: string) {
    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(updatedAt));
}
