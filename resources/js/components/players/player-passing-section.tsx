import { Route } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import PlayerStatGrid from './player-stat-grid';

interface Props {
    stats: PlayerDetailsSeasonStat;
}

export default function PlayerPassingSection({ stats }: Props) {
    const items = [
        {
            label: 'Total passes',
            value: stats.totalPasses,
        },
        {
            label: 'Key passes',
            value: stats.keyPasses,
            highlight: true,
        },
        {
            label: 'Pass accuracy',
            value: stats.passAccuracy,
            suffix: '%',
            highlight: true,
        },
        {
            label: 'Assists',
            value: stats.assists,
            highlight: true,
        },
    ];

    return (
        <PlayerStatGrid
            title="Passing"
            icon={<Route className="size-5 text-slate-700" />}
            items={items}
        />
    );
}
