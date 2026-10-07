import {
    Activity,
    Clock,
    Crosshair,
    Goal,
    Shield,
    Trophy,
    Zap,
} from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';

interface Props {
    stats: PlayerDetailsSeasonStat;
    isGoalkeeper: boolean;
}

interface StatItem {
    icon: React.ReactNode;
    label: string;
    value: number | null;
    suffix?: string;
    highlight?: boolean;
}

export default function PlayerSeasonOverview({ stats, isGoalkeeper }: Props) {
    const fieldPlayerItems: StatItem[] = [
        {
            icon: <Activity className="size-5" />,
            label: 'Wedstrijden',
            value: stats.appearances,
            highlight: true,
        },
        {
            icon: <Clock className="size-5" />,
            label: 'Minuten',
            value: stats.minutes,
        },
        {
            icon: <Trophy className="size-5" />,
            label: 'Doelpunten',
            value: stats.goals,
            highlight: true,
        },
        {
            icon: <Zap className="size-5" />,
            label: 'Assists',
            value: stats.assists,
            highlight: true,
        },
        {
            icon: <Crosshair className="size-5" />,
            label: 'Schoten op doel',
            value: stats.shotsOnTarget,
            suffix: stats.totalShots ? `/ ${stats.totalShots}` : undefined,
        },
        {
            icon: <Shield className="size-5" />,
            label: 'Beoordeling',
            value: stats.rating,
            suffix: stats.rating ? '/ 10' : undefined,
            highlight: true,
        },
    ];

    const goalkeeperItems: StatItem[] = [
        {
            icon: <Activity className="size-5" />,
            label: 'Wedstrijden',
            value: stats.appearances,
            highlight: true,
        },
        {
            icon: <Clock className="size-5" />,
            label: 'Minuten',
            value: stats.minutes,
        },
        {
            icon: <Goal className="size-5" />,
            label: 'Tegendoelpunten',
            value: stats.goalsConceded,
            highlight: true,
        },
        {
            icon: <Shield className="size-5" />,
            label: 'Reddingen',
            value: stats.saves,
            highlight: true,
        },
        {
            icon: <Crosshair className="size-5" />,
            label: 'Clean sheets',
            value:
                stats.goalsConceded === 0 &&
                stats.appearances &&
                stats.appearances > 0
                    ? stats.appearances
                    : null,
            suffix:
                stats.goalsConceded === 0 &&
                stats.appearances &&
                stats.appearances > 0
                    ? 'schatting'
                    : undefined,
        },
        {
            icon: <Shield className="size-5" />,
            label: 'Beoordeling',
            value: stats.rating,
            suffix: stats.rating ? '/ 10' : undefined,
            highlight: true,
        },
    ];

    const items = isGoalkeeper ? goalkeeperItems : fieldPlayerItems;

    const visibleItems = items.filter((item) => {
        if (item.value === null || item.value === undefined) {
            return false;
        }

        if (
            item.value === 0 &&
            item.label !== 'Doelpunten' &&
            item.label !== 'Assists' &&
            item.label !== 'Rode kaarten'
        ) {
            return false;
        }

        return true;
    });

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {visibleItems.map((item) => {
                const displayValue =
                    typeof item.value === 'number' && item.value % 1 !== 0
                        ? item.value.toFixed(1)
                        : String(item.value);

                return (
                    <div
                        key={item.label}
                        className={`flex min-h-32 flex-col items-center justify-center rounded-lg border p-4 text-center ${
                            item.highlight
                                ? 'border-border-strong bg-brand-subtle'
                                : 'border-border-subtle bg-surface'
                        }`}
                    >
                        <span
                            className={`mb-2 shrink-0 ${
                                item.highlight
                                    ? 'text-positive'
                                    : 'text-primary'
                            }`}
                        >
                            {item.icon}
                        </span>
                        <p
                            className={`mb-1 shrink-0 text-2xl font-bold tabular-nums ${
                                item.highlight
                                    ? 'text-foreground'
                                    : 'text-foreground'
                            }`}
                        >
                            {displayValue}
                            {item.suffix ? (
                                <span className="ml-1 text-sm font-semibold text-text-muted">
                                    {item.suffix}
                                </span>
                            ) : null}
                        </p>
                        <div className="flex h-9 w-full items-start justify-center">
                            <p className="text-xs leading-tight font-semibold text-text-muted uppercase">
                                {item.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
