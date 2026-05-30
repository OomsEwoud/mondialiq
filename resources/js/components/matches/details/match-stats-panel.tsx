import MatchStatRow from '@/components/matches/details/match-stat-row';
import MatchStatsHeader from '@/components/matches/details/match-stats-header';
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
