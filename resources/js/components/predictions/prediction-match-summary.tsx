import TeamCodeLink from '@/components/teams/team-code-link';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function PredictionMatchSummary({ match }: Props) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex min-w-0 items-center gap-3">
                <TeamCodeLink
                    id={match.homeTeamId}
                    code={match.homeTeamShort}
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                />
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-500">
                    VS
                </span>
                <TeamCodeLink
                    id={match.awayTeamId}
                    code={match.awayTeamShort}
                    logo={match.awayTeamLogo}
                    name={match.awayTeam}
                    reverse
                />
            </div>

            <div className="text-left">
                <p className="text-xs font-bold text-slate-400">
                    {match.round}
                </p>
                <p className="text-sm font-medium text-slate-600">
                    {match.date} &middot; {match.time}
                </p>
            </div>
        </div>
    );
}
