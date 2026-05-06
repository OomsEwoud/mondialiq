import { Link } from '@inertiajs/react';
import type { Match } from '@/types/match';

interface Props {
    matches: Match[];
}

export default function UpcomingMatches({ matches }: Props) {
    return (
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
            <h2 className="mb-4 text-sm font-medium text-slate-700">
                Upcoming matches
            </h2>
            <div className="flex flex-col gap-3">
                {matches?.map((match) => (
                    <div
                        key={match.id}
                        className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
                    >
                        <div className="flex justify-end mb-3">
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded leading-none">
                                {match.day} · {match.time}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            <div className="flex flex-1 items-center gap-2 min-w-0">
                                <img
                                    src={match.homeTeamLogo}
                                    alt={match.homeTeam}
                                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                                />
                                <span className="block truncate rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-700 sm:text-xs">
                                    {match.homeTeam}
                                </span>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold text-slate-300">vs</span>
                            <div className="flex flex-1 flex-row-reverse items-center gap-2 min-w-0 text-right">
                                <img
                                    src={match.awayTeamLogo}
                                    alt={match.awayTeam}
                                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                                />
                                <span className="block truncate rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-700 sm:text-xs">
                                    {match.awayTeam}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-slate-50 pt-2">
                            <Link
                                href={`/matches/${match.id}`}
                                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                            >
                                View match details →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}