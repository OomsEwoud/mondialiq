import { CalendarDays, Clock } from 'lucide-react';
import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function UserPredictionMatchSummary({ match }: Props) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm sm:p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                <UserPredictionTeam
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                    code={match.homeTeamShort}
                />
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                    vs
                </span>
                <UserPredictionTeam
                    logo={match.awayTeamLogo}
                    name={match.awayTeam}
                    code={match.awayTeamShort}
                    align="right"
                />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 text-xs font-semibold text-slate-600 sm:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    <CalendarDays className="h-4 w-4 text-slate-600" />
                    {match.date}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    <Clock className="h-4 w-4 text-slate-600" />
                    {match.time}
                </span>
            </div>
        </div>
    );
}
