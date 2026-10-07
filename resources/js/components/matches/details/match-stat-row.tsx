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
                'border-b px-1 py-3 text-sm',
                isComparable
                    ? 'border-border/60'
                    : 'border-border/60 bg-muted/30',
            )}
        >
            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 sm:grid-cols-[5.5rem_minmax(0,1fr)_5.5rem] sm:gap-3">
                <span className="min-w-0 truncate text-left font-bold text-foreground">
                    {homeValue}
                </span>
                <p className="min-w-0 text-center text-muted-foreground">
                    {formatStatLabel(stat.name)}
                </p>
                <span className="min-w-0 truncate text-right font-bold text-foreground">
                    {awayValue}
                </span>
            </div>

            {comparisonBar}
        </div>
    );
}
