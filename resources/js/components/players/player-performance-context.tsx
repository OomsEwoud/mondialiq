import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import { perNinety } from '@/utils/player-stats';

export default function PlayerPerformanceContext({
    stats,
}: {
    stats: PlayerDetailsSeasonStat;
}) {
    const items = [
        { label: 'Doelpunten', value: perNinety(stats.goals, stats.minutes) },
        { label: 'Assists', value: perNinety(stats.assists, stats.minutes) },
        { label: 'Schoten', value: perNinety(stats.totalShots, stats.minutes) },
        {
            label: 'Sleutelpasses',
            value: perNinety(stats.keyPasses, stats.minutes),
        },
    ].filter((item) => item.value !== null);

    if (items.length === 0) {
        return null;
    }

    return (
        <section className="rounded-lg bg-surface px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold">Per 90 minuten</h3>
                <p className="text-xs text-muted-foreground">
                    Op basis van {stats.minutes?.toLocaleString('nl-NL')}{' '}
                    gespeelde minuten
                </p>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
                {items.map((item) => (
                    <div key={item.label}>
                        <dt className="text-sm text-muted-foreground">
                            {item.label}
                        </dt>
                        <dd className="mt-1 text-xl font-semibold tabular-nums">
                            {item.value?.toLocaleString('nl-NL', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </dd>
                    </div>
                ))}
            </dl>
            {(stats.minutes ?? 0) < 90 && (
                <p className="mt-4 text-xs text-muted-foreground">
                    Minder dan een volledige wedstrijd gespeeld; deze
                    gemiddelden kunnen sterk schommelen.
                </p>
            )}
        </section>
    );
}
