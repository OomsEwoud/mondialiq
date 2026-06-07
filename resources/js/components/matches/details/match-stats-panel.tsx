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
    const groupedStats = statCategories
        .map((category) => ({
            category,
            stats: sortStatsByDisplayPriority(
                match.stats.filter(
                    (stat) => getStatCategory(stat.name) === category,
                ),
            ),
        }))
        .filter((group) => group.stats.length > 0);

    return (
        <div className="flex flex-col gap-4">
            <MatchStatsHeader
                homeName={match.homeTeam.name}
                awayName={match.awayTeam.name}
            />

            <div className="flex flex-col gap-4">
                {groupedStats.map(({ category, stats }) => (
                    <section key={category} className="flex flex-col gap-2">
                        <h3 className="px-1 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            {category}
                        </h3>
                        <div className="flex flex-col gap-2">
                            {stats.map((stat) => (
                                <MatchStatRow key={stat.name} stat={stat} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
