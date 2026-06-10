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
            label: 'Appearances',
            value: stats.appearances,
            highlight: true,
        },
        {
            icon: <Clock className="size-5" />,
            label: 'Total minutes played',
            value: stats.minutes,
        },
        {
            icon: <Trophy className="size-5" />,
            label: 'Goals',
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
            label: 'Shots on target',
            value: stats.shotsOnTarget,
            suffix: stats.totalShots ? `/ ${stats.totalShots}` : undefined,
        },
        {
            icon: <Shield className="size-5" />,
            label: 'Rating',
            value: stats.rating,
            suffix: stats.rating ? '/ 10' : undefined,
            highlight: true,
        },
    ];

    const goalkeeperItems: StatItem[] = [
        {
            icon: <Activity className="size-5" />,
            label: 'Appearances',
            value: stats.appearances,
            highlight: true,
        },
        {
            icon: <Clock className="size-5" />,
            label: 'Total minutes played',
            value: stats.minutes,
        },
        {
            icon: <Goal className="size-5" />,
            label: 'Goals conceded',
            value: stats.goalsConceded,
            highlight: true,
        },
        {
            icon: <Shield className="size-5" />,
            label: 'Saves',
            value: stats.saves,
            highlight: true,
        },
        {
            icon: <Crosshair className="size-5" />,
            label: 'Clean sheets',
            value: stats.goalsConceded === 0 && stats.appearances && stats.appearances > 0
                ? stats.appearances
                : null,
            suffix: stats.goalsConceded === 0 && stats.appearances && stats.appearances > 0
                ? 'est.'
                : undefined,
        },
        {
            icon: <Shield className="size-5" />,
            label: 'Rating',
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

        if (item.value === 0 && item.label !== 'Goals' && item.label !== 'Assists' && item.label !== 'Red cards') {
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
                        className={`flex h-full flex-col items-center rounded-2xl border p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                            item.highlight
                                ? 'border-cyan-200 bg-gradient-to-b from-cyan-50/60 to-white'
                                : 'border-slate-200 bg-gradient-to-b from-white to-slate-50/60'
                        }`}
                    >
                        <span
                            className={`mb-2 shrink-0 ${
                                item.highlight ? 'text-cyan-600' : 'text-slate-500'
                            }`}
                        >
                            {item.icon}
                        </span>
                        <p
                            className={`mb-1 shrink-0 text-2xl font-bold tabular-nums ${
                                item.highlight ? 'text-slate-900' : 'text-slate-700'
                            }`}
                        >
                            {displayValue}
                            {item.suffix ? (
                                <span className="ml-1 text-sm font-semibold text-slate-400">
                                    {item.suffix}
                                </span>
                            ) : null}
                        </p>
                        <div className="flex h-9 w-full items-start justify-center">
                            <p className="text-xs leading-tight font-semibold tracking-wide text-slate-500 uppercase">
                                {item.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
