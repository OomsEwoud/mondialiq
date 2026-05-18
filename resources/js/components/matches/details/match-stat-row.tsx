import type { MatchDetailsStat } from '@/types/match-details';

interface Props {
    stat: MatchDetailsStat;
    homeCode: string;
    awayCode: string;
}

export default function MatchStatRow({ stat, homeCode, awayCode }: Props) {
    const homeValue = stat.home === null ? '-' : String(stat.home);
    const awayValue = stat.away === null ? '-' : String(stat.away);

    return (
        <div className="grid grid-cols-[64px_1fr_64px] items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <span className="font-black text-blue-950">{homeValue}</span>
            <div className="text-center">
                <p className="font-bold text-slate-700">{stat.name}</p>
                <p className="text-[11px] font-medium text-slate-400">
                    {homeCode} vs {awayCode}
                </p>
            </div>
            <span className="text-right font-black text-blue-950">
                {awayValue}
            </span>
        </div>
    );
}
