import TeamCodeLink from '@/components/teams/team-code-link';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchSummary({ match }: Props) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
                <TeamCodeLink
                    id={match.homeTeamId}
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                    code={match.homeTeamShort}
                />
                <span className="text-xs text-slate-400">vs</span>
                <TeamCodeLink
                    id={match.awayTeamId}
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
