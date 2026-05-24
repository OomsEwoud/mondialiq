import type { Match } from '@/types/match';
import {
    getDisplayMatchScore,
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

    return (
        <div className="flex min-w-20 items-center justify-center rounded-xl border border-blue-100 bg-blue-950 px-3 py-2 text-xl font-black text-white shadow-sm sm:min-w-24 sm:text-2xl">
            {score.home}
            <span className="px-2 text-cyan-300">-</span>
            {score.away}
        </div>
    );
}
