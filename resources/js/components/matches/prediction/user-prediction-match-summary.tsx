import { CalendarDays, Clock } from 'lucide-react';
import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function UserPredictionMatchSummary({ match }: Props) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <UserPredictionTeam
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                    code={match.homeTeamShort}
                />
                <span className="text-xs font-black text-slate-300">VS</span>
                <UserPredictionTeam
                    logo={match.awayTeamLogo}
                    name={match.awayTeam}
                    code={match.awayTeamShort}
                    align="right"
                />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                    {match.date}
                </span>
                <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    {match.time}
                </span>
            </div>
        </div>
    );
}
