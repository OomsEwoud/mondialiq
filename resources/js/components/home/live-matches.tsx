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
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Live now
            </h2>
            <div className="flex flex-col gap-3">
                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="rounded-lg border border-slate-100 bg-white p-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium">
                                {match.home}
                            </span>
                            <span className="text-lg font-bold text-slate-800">
                                {match.homeScore} – {match.awayScore}
                            </span>
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium">
                                {match.away}
                            </span>
                            <span className="text-xs font-medium text-green-500">
                                {match.minute}'
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}