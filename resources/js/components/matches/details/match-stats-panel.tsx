import MatchStatRow from '@/components/matches/details/match-stat-row';
import { cn } from '@/lib/utils';
import type { MatchDetails } from '@/types/match-details';
import type { MatchStatCategory } from '@/utils/match-stats';
import {
    getStatCategory,
    sortStatsByDisplayPriority,
} from '@/utils/match-stats';

interface Props {
    match: MatchDetails;
}

const statCategories: MatchStatCategory[] = [
    'Attack',
    'Possession & passing',
    'Discipline & defending',
    'Goalkeeping',
    'Other',
];

export default function MatchStatsPanel({ match }: Props) {
    return (
        <div className="flex flex-col gap-4">
            <MatchStatsHeader
                homeName={match.homeTeam.name}
                awayName={match.awayTeam.name}
            />

            <div className="flex flex-col gap-4">
                {statCategories.map((category) => {
                    const stats = sortStatsByDisplayPriority(
                        match.stats.filter(
                            (stat) => getStatCategory(stat.name) === category,
                        ),
                    );

                    if (stats.length === 0) {
                        return null;
                    }

                    return (
                        <section key={category} className="flex flex-col gap-2">
                            <h3 className="px-1 text-xs font-black tracking-wide text-slate-400 uppercase">
                                {category}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {stats.map((stat) => (
                                    <MatchStatRow key={stat.name} stat={stat} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}

function MatchStatsHeader({
    homeName,
    awayName,
}: {
    homeName: string;
    awayName: string;
}) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 sm:gap-4 sm:px-4">
            <TeamHeading label="Home" name={homeName} align="left" />
            <span className="pt-5 text-[10px] font-black tracking-wide text-slate-300 uppercase">
                vs
            </span>
            <TeamHeading label="Away" name={awayName} align="right" />
        </div>
    );
}

function TeamHeading({
    label,
    name,
    align,
}: {
    label: string;
    name: string;
    align: 'left' | 'right';
}) {
    return (
        <div
            className={cn(
                'min-w-0',
                align === 'right' ? 'text-right' : 'text-left',
            )}
        >
            <p className="text-[10px] font-black tracking-wide text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-0.5 text-xs leading-snug font-black text-blue-950 sm:text-sm">
                {name}
            </p>
        </div>
    );
}
