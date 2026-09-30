import { Route } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import PlayerStatGrid from './player-stat-grid';

interface Props {
    stats: PlayerDetailsSeasonStat;
}

export default function PlayerPassingSection({ stats }: Props) {
    const items = [
        {
            label: 'Passes',
            value: stats.totalPasses,
        },
        {
            label: 'Sleutelpasses',
            value: stats.keyPasses,
            highlight: true,
        },
        {
            label: 'Passnauwkeurigheid',
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
            icon={<Route className="size-5" />}
            items={items}
        />
    );
}
