import { Scale } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import PlayerStatGrid from './player-stat-grid';

interface Props {
    stats: PlayerDetailsSeasonStat;
}

export default function PlayerDisciplineSection({ stats }: Props) {
    const items = [
        {
            label: 'Yellow cards',
            value: stats.yellowCards,
        },
        {
            label: 'Yellow-red cards',
            value: stats.yellowRedCards,
        },
        {
            label: 'Red cards',
            value: stats.redCards,
            highlight: true,
        },
        {
            label: 'Penalties committed',
            value: stats.penaltiesCommitted,
        },
        {
            label: 'Penalties won',
            value: stats.penaltiesWon,
        },
    ];

    return (
        <PlayerStatGrid
            title="Discipline"
            icon={<Scale className="size-5 text-slate-700" />}
            items={items}
        />
    );
}
