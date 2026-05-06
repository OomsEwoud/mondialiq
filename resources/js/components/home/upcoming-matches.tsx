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
                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="rounded-lg border border-slate-100 bg-white p-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium">
                                    {match.homeTeam}
                                </span>
                                <span className="text-xs text-slate-400">vs</span>
                                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium">
                                    {match.awayTeam}
                                </span>
                            </div>
                            <span className="text-xs font-medium text-red-500">
                                {match.displayDay} · {match.displayTime}
                            </span>
                        </div>
                        <Link
                            href={`/matches/${match.id}`}
                            className="mt-2 block text-xs text-blue-600 hover:underline"
                        >
                            View match details →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}