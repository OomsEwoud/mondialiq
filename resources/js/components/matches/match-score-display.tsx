import { cn } from '@/lib/utils';
import type { Match } from '@/types/match';
import {
    getDisplayMatchScore,
    getMatchStatusLabel,
    getWinner,
    hasDisplayMatchScore,
    shouldShowMatchScore,
} from '@/utils/match-status';

interface Props {
    match: Match;
}

export default function MatchScoreDisplay({ match }: Props) {
    if (!shouldShowMatchScore(match) || !hasDisplayMatchScore(match)) {
        return (
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-400">
                vs
            </span>
        );
    }

    const score = getDisplayMatchScore(match);
    const winner = getWinner(match);

    return (
        <div className="flex min-w-24 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xs sm:min-w-28">
            <div className="flex items-baseline justify-center gap-2 text-2xl leading-none font-black text-blue-950 tabular-nums sm:text-3xl">
                <span
                    className={cn(
                        winner === 'home' && 'text-blue-950',
                        winner === 'away' && 'font-bold text-slate-500',
                    )}
                >
                    {score.home}
                </span>
                <span className="text-lg font-black text-slate-300 sm:text-xl">
                    -
                </span>
                <span
                    className={cn(
                        winner === 'away' && 'text-blue-950',
                        winner === 'home' && 'font-bold text-slate-500',
                    )}
                >
                    {score.away}
                </span>
            </div>
            <span className="mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black tracking-wide text-slate-500 uppercase">
                {getMatchStatusLabel(match)}
            </span>
        </div>
    );
}
