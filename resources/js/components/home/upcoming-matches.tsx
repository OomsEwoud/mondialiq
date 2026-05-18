import { Link } from '@inertiajs/react';
import type { UpcomingMatch } from '@/types/match';

interface Props {
    matches: UpcomingMatch[];
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
                        <div className="mb-3 flex justify-end">
                            <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] leading-none font-bold text-red-500">
                                {match.day} · {match.time}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <img
                                    src={match.homeTeamLogo}
                                    alt={match.homeTeam}
                                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                                />
                                <span className="block truncate rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-700 sm:text-xs">
                                    {match.homeTeamShort}
                                </span>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold text-slate-300">
                                vs
                            </span>
                            <div className="flex min-w-0 flex-1 flex-row-reverse items-center gap-2 text-right">
                                <img
                                    src={match.awayTeamLogo}
                                    alt={match.awayTeam}
                                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                                />
                                <span className="block truncate rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-700 sm:text-xs">
                                    {match.awayTeamShort}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-slate-50 pt-2">
                            <Link
                                href={`/matches/${match.id}`}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 transition-colors hover:text-blue-800"
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
