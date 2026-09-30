import { Shield } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import PlayerStatGrid from './player-stat-grid';

interface Props {
    stats: PlayerDetailsSeasonStat;
}

export default function PlayerDefensiveSection({ stats }: Props) {
    const items = [
        {
            label: 'Tackles',
            value: stats.tackles,
        },
        {
            label: 'Geblokt',
            value: stats.blocks,
        },
        {
            label: 'Onderscheppingen',
            value: stats.interceptions,
        },
        {
            label: 'Duels gewonnen',
            value: stats.duelsWon,
            suffix: stats.totalDuels ? `/ ${stats.totalDuels}` : undefined,
            highlight: true,
        },
        {
            label: 'Overtredingen',
            value: stats.foulsCommitted,
        },
        {
            label: 'Fouten mee',
            value: stats.foulsDrawn,
        },
    ];

    return (
        <PlayerStatGrid
            title="Verdedigend"
            icon={<Shield className="size-5" />}
            items={items}
        />
    );
}
