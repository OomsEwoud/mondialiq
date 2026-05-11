import type { MatchDetails, MatchDetailsStat } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchStatsCard({ match }: Props) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black text-blue-950">
                Team stats
            </h2>
            {match.stats.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {match.stats.map((stat) => (
                        <StatRow
                            key={stat.name}
                            stat={stat}
                            homeCode={match.homeTeam.code}
                            awayCode={match.awayTeam.code}
                        />
                    ))}
                </div>
            ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No team stats available yet.
                </p>
            )}
        </section>
    );
}

interface StatRowProps {
    stat: MatchDetailsStat;
    homeCode: string;
    awayCode: string;
}

function StatRow({ stat, homeCode, awayCode }: StatRowProps) {
    return (
        <div className="grid grid-cols-[64px_1fr_64px] items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <span className="font-black text-blue-950">
                {formatStat(stat.home)}
            </span>
            <div className="text-center">
                <p className="font-bold text-slate-700">{stat.name}</p>
                <p className="text-[11px] font-medium text-slate-400">
                    {homeCode} vs {awayCode}
                </p>
            </div>
            <span className="text-right font-black text-blue-950">
                {formatStat(stat.away)}
            </span>
        </div>
    );
}

function formatStat(value: number | null) {
    return value === null ? '-' : String(value);
}
