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
            <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                vs
            </span>
        );
    }

    const score = getDisplayMatchScore(match);
    const winner = getWinner(match);

    return (
        <div className="flex min-w-24 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm sm:min-w-28">
            <div className="flex items-baseline justify-center gap-2 text-2xl leading-none font-semibold text-slate-900 tabular-nums sm:text-3xl">
                <span
                    className={cn(
                        winner === 'home' && 'text-slate-900',
                        winner === 'away' && 'font-semibold text-slate-600',
                    )}
                >
                    {score.home}
                </span>
                <span className="text-lg font-semibold text-slate-300 sm:text-xl">
                    -
                </span>
                <span
                    className={cn(
                        winner === 'away' && 'text-slate-900',
                        winner === 'home' && 'font-semibold text-slate-600',
                    )}
                >
                    {score.away}
                </span>
            </div>
            <span className="mt-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                {getMatchStatusLabel(match)}
            </span>
        </div>
    );
}
