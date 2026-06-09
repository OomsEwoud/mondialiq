import { TrendingUp } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import PlayerStatGrid from './player-stat-grid';

interface Props {
    stats: PlayerDetailsSeasonStat;
}

export default function PlayerAttackingSection({ stats }: Props) {
    const items = [
        {
            label: 'Goals',
            value: stats.goals,
            highlight: true,
        },
        {
            label: 'Assists',
            value: stats.assists,
            highlight: true,
        },
        {
            label: 'Total shots',
            value: stats.totalShots,
        },
        {
            label: 'Shots on target',
            value: stats.shotsOnTarget,
            suffix: stats.totalShots ? `/ ${stats.totalShots}` : undefined,
        },
        {
            label: 'Key passes',
            value: stats.keyPasses,
        },
        {
            label: 'Dribbles',
            value: stats.dribblesSuccess,
            suffix: stats.dribblesAttempts ? `/ ${stats.dribblesAttempts}` : undefined,
        },
        {
            label: 'Dribbled past',
            value: stats.dribblesPast,
        },
        {
            label: 'Penalties scored',
            value: stats.penaltiesScored,
        },
        {
            label: 'Penalties missed',
            value: stats.penaltiesMissed,
        },
    ];

    return (
        <PlayerStatGrid
            title="Attacking"
            icon={<TrendingUp className="size-5 text-slate-700" />}
            items={items}
        />
    );
}
