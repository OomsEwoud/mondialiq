import { Link } from '@inertiajs/react';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function PredictionMatchSummary({ match }: Props) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex min-w-0 items-center gap-3">
                <TeamCode
                    id={match.homeTeamId}
                    code={match.homeTeamShort}
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                />
                <span className="text-xs font-black text-slate-300">VS</span>
                <TeamCode
                    id={match.awayTeamId}
                    code={match.awayTeamShort}
                    logo={match.awayTeamLogo}
                    name={match.awayTeam}
                    reverse
                />
            </div>

            <div className="text-left">
                <p className="text-xs text-slate-400">{match.round}</p>
                <p className="text-sm font-medium text-slate-600">
                    {match.date} &middot; {match.time}
                </p>
            </div>
        </div>
    );
}

interface TeamCodeProps {
    id: number;
    code: string;
    logo: string;
    name: string;
    reverse?: boolean;
}

function TeamCode({ id, code, logo, name, reverse = false }: TeamCodeProps) {
    return (
        <Link
            href={showTeam.url(id)}
            className="flex items-center gap-2 rounded-lg transition-colors hover:bg-blue-50"
        >
            {!reverse && (
                <img
                    src={logo}
                    alt={name}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
            )}
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                {code}
            </span>
            {reverse && (
                <img
                    src={logo}
                    alt={name}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
            )}
        </Link>
    );
}
