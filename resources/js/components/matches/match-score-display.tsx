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
            <span className="flex size-10 items-center justify-center rounded-full border border-[#343d37] bg-[#0b0e0d] text-xs font-bold text-[#7f8882] sm:size-12">
                vs
            </span>
        );
    }

    const score = getDisplayMatchScore(match);
    const winner = getWinner(match);

    return (
        <div className="flex min-w-20 flex-col items-center justify-center rounded-md border border-[#343d37] bg-[#0b0e0d] px-2 py-2 sm:min-w-28 sm:px-3">
            <div className="flex items-baseline justify-center gap-2 text-2xl leading-none font-black text-[#f3f4f1] tabular-nums sm:text-3xl">
                <span
                    className={cn(
                        winner === 'home' && 'text-white',
                        winner === 'away' && 'text-[#717a74]',
                    )}
                >
                    {score.home}
                </span>
                <span className="text-lg font-semibold text-[#4b554f] sm:text-xl">
                    -
                </span>
                <span
                    className={cn(
                        winner === 'away' && 'text-white',
                        winner === 'home' && 'text-[#717a74]',
                    )}
                >
                    {score.away}
                </span>
            </div>
            <span className="mt-1 text-[10px] font-bold text-[#70b98e] uppercase">
                {getMatchStatusLabel(match)}
            </span>
        </div>
    );
}
