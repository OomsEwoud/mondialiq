import type { PlayerDetailsSeasonStat } from '@/types/player-details';

export default function PlayerSeasonOverview({
    stats,
    isGoalkeeper,
}: {
    stats: PlayerDetailsSeasonStat;
    isGoalkeeper: boolean;
}) {
    const items = [
        { label: 'Beoordeling', value: stats.rating, suffix: '/ 10' },
        {
            label: isGoalkeeper ? 'Reddingen' : 'Doelpunten',
            value: isGoalkeeper ? stats.saves : stats.goals,
        },
        {
            label: isGoalkeeper ? 'Tegendoelpunten' : 'Assists',
            value: isGoalkeeper ? stats.goalsConceded : stats.assists,
        },
        { label: 'Minuten', value: stats.minutes },
    ];

    return (
        <div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7 border-y border-border-subtle py-6 sm:grid-cols-4 sm:py-8">
                {items.map((item) => (
                    <div key={item.label}>
                        <dt className="text-sm text-muted-foreground">
                            {item.label}
                        </dt>
                        <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                            {item.value === null ? (
                                <span className="text-base font-normal text-muted-foreground">
                                    Niet beschikbaar
                                </span>
                            ) : (
                                item.value.toLocaleString('nl-NL', {
                                    maximumFractionDigits: 1,
                                })
                            )}
                            {item.value !== null && item.suffix && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    {item.suffix}
                                </span>
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
            {stats.appearances !== null && (
                <p className="mt-3 text-sm text-muted-foreground">
                    {stats.appearances} wedstrijden in dit seizoen
                    {stats.isCaptain ? ' · Aanvoerder' : ''}
                </p>
            )}
        </div>
    );
}
