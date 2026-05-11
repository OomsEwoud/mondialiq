import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchSummary({ match }: Props) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
                <img
                    src={match.homeTeamLogo}
                    alt={match.homeTeam}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                    {match.homeTeamShort}
                </span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                    {match.awayTeamShort}
                </span>
                <img
                    src={match.awayTeamLogo}
                    alt={match.awayTeam}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
            </div>

            <div className="text-left sm:text-right">
                <p className="text-xs text-slate-400">{match.round}</p>
                <p className="text-sm font-medium text-slate-600">
                    {match.date} &middot; {match.time}
                </p>
            </div>
        </div>
    );
}
