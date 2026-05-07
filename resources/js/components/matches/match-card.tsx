import { Link } from '@inertiajs/react';
import Chances from '@/components/matches/chances';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchCard({ match }: Props) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                <div className="text-right">
                    <p className="text-xs text-slate-400">{match.round}</p>
                    <p className="text-sm font-medium text-slate-600">
                        {match.date} · {match.time}
                    </p>
                </div>
            </div>

            {match.prediction ? (
                <Chances
                    homeWin={match.prediction.homeWin}
                    draw={match.prediction.draw}
                    awayWin={match.prediction.awayWin}
                />
            ) : (
                <div className="mt-3 border-t border-slate-100 pt-3 text-center text-xs text-slate-400 italic">
                    Predictions are not yet available for this match.
                </div>
            )}

            <div className="mt-3 text-center">
                <Link
                    href={`/matches/${match.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                >
                    View Full Details →
                </Link>
            </div>
        </div>
    );
}
