interface Match {
    id: number;
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
    minute: number;
}

interface Props {
    matches: Match[];
}

export default function LiveMatches({ matches }: Props) {
    return (
        <section className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm shadow-blue-950/5 backdrop-blur">
            <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-black tracking-widest text-emerald-600 uppercase">
                        Match center
                    </p>
                    <h2 className="flex items-center gap-2 text-base font-black text-slate-950">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Live now
                    </h2>
                </div>
            </header>
            <div className="flex flex-col gap-3">
                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm"
                    >
                        <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3">
                            <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-center text-xs font-black text-slate-700">
                                {match.home}
                            </span>
                            <span className="text-lg font-black text-blue-950">
                                {match.homeScore} - {match.awayScore}
                            </span>
                            <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-center text-xs font-black text-slate-700">
                                {match.away}
                            </span>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                                {match.minute}'
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
