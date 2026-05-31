import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { show as showMatch } from '@/routes/matches';
import type { UpcomingMatch } from '@/types/match';

interface Props {
    matches: UpcomingMatch[];
}

export default function UpcomingMatches({ matches }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5">
            <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-black tracking-widest text-cyan-600 uppercase">
                        Schedule
                    </p>
                    <h2 className="text-base font-black text-slate-950">
                        Upcoming matches
                    </h2>
                </div>
            </header>

            <div className="flex flex-col gap-3">
                {matches?.map((match) => (
                    <article
                        key={match.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                                Matchday
                            </span>
                            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] leading-none font-black text-blue-950">
                                {match.day} - {match.time}
                            </span>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <img
                                    src={match.homeTeamLogo}
                                    alt={match.homeTeam}
                                    className="h-8 w-8 shrink-0 object-contain"
                                />
                                <span className="min-w-0 truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-800">
                                    {match.homeTeamShort}
                                </span>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-400 ring-1 ring-slate-200">
                                vs
                            </span>
                            <div className="flex min-w-0 flex-row-reverse items-center gap-2 text-right">
                                <img
                                    src={match.awayTeamLogo}
                                    alt={match.awayTeam}
                                    className="h-8 w-8 shrink-0 object-contain"
                                />
                                <span className="min-w-0 truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-800">
                                    {match.awayTeamShort}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 border-t border-slate-200 pt-2">
                            <Link
                                href={showMatch.url(match.id)}
                                className="inline-flex items-center gap-1.5 rounded-full px-0.5 text-xs font-black text-blue-950 transition-colors hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                View match details
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
