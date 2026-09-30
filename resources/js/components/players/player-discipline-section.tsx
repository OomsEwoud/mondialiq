import { Scale } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import PlayerStatGrid from './player-stat-grid';

interface Props {
    stats: PlayerDetailsSeasonStat;
}

export default function PlayerDisciplineSection({ stats }: Props) {
    const items = [
        {
            label: 'Gele kaarten',
            value: stats.yellowCards,
        },
        {
            label: 'Tweede geel',
            value: stats.yellowRedCards,
        },
        {
            label: 'Rode kaarten',
            value: stats.redCards,
            highlight: true,
        },
        {
            label: 'Penalty’s veroorzaakt',
            value: stats.penaltiesCommitted,
        },
        {
            label: 'Penalty’s verdiend',
            value: stats.penaltiesWon,
        },
    ];

    return (
        <PlayerStatGrid
            title="Discipline"
            icon={<Scale className="size-5" />}
            items={items}
        />
    );
}
