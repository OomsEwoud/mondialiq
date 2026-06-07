import MatchStatComparisonBar from '@/components/matches/details/match-stat-comparison-bar';
import { cn } from '@/lib/utils';
import type { MatchDetailsStat } from '@/types/match-details';
import { formatStatLabel, isComparableStat } from '@/utils/match-stats';

interface Props {
    stat: MatchDetailsStat;
}

export default function MatchStatRow({ stat }: Props) {
    const homeValue = stat.home === null ? '-' : String(stat.home);
    const awayValue = stat.away === null ? '-' : String(stat.away);
    const isComparable = isComparableStat(stat.name);
    const comparableHomeValue = stat.home;
    const comparableAwayValue = stat.away;
    const comparisonBar =
        isComparable &&
        comparableHomeValue !== null &&
        comparableAwayValue !== null ? (
            <div className="mt-2">
                <MatchStatComparisonBar
                    homeValue={comparableHomeValue}
                    awayValue={comparableAwayValue}
                />
            </div>
        ) : null;

    return (
        <div
            className={cn(
                'rounded-xl border px-3 py-3 text-sm shadow-xs',
                isComparable
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-100 bg-slate-50/70',
            )}
        >
            <div className="grid grid-cols-[4.25rem_minmax(0,1fr)_4.25rem] items-center gap-2 sm:grid-cols-[5.5rem_minmax(0,1fr)_5.5rem] sm:gap-3">
                <span className="min-w-0 truncate text-left font-bold text-slate-900">
                    {homeValue}
                </span>
                <p className="min-w-0 truncate text-center font-bold text-slate-700">
                    {formatStatLabel(stat.name)}
                </p>
                <span className="min-w-0 truncate text-right font-bold text-slate-900">
                    {awayValue}
                </span>
            </div>

            {comparisonBar}
        </div>
    );
}
