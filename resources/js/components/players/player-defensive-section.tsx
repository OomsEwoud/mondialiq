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
            label: 'Blocks',
            value: stats.blocks,
        },
        {
            label: 'Interceptions',
            value: stats.interceptions,
        },
        {
            label: 'Duels won',
            value: stats.duelsWon,
            suffix: stats.totalDuels ? `/ ${stats.totalDuels}` : undefined,
            highlight: true,
        },
        {
            label: 'Fouls committed',
            value: stats.foulsCommitted,
        },
        {
            label: 'Fouls drawn',
            value: stats.foulsDrawn,
        },
    ];

    return (
        <PlayerStatGrid
            title="Defensive"
            icon={<Shield className="size-5 text-slate-700" />}
            items={items}
        />
    );
}
