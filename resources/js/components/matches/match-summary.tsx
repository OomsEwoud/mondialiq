import { Link } from '@inertiajs/react';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchSummary({ match }: Props) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
                <TeamLink
                    href={showTeam.url(match.homeTeamId)}
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                    code={match.homeTeamShort}
                />
                <span className="text-xs text-slate-400">vs</span>
                <TeamLink
                    href={showTeam.url(match.awayTeamId)}
                    logo={match.awayTeamLogo}
                    name={match.awayTeam}
                    code={match.awayTeamShort}
                    reverse
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

interface TeamLinkProps {
    href: string;
    logo: string;
    name: string;
    code: string;
    reverse?: boolean;
}

function TeamLink({ href, logo, name, code, reverse = false }: TeamLinkProps) {
    return (
        <Link
            href={href}
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
