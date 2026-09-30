import { TrendingUp } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import PlayerStatGrid from './player-stat-grid';

interface Props {
    stats: PlayerDetailsSeasonStat;
}

export default function PlayerAttackingSection({ stats }: Props) {
    const items = [
        {
            label: 'Doelpunten',
            value: stats.goals,
            highlight: true,
        },
        {
            label: 'Assists',
            value: stats.assists,
            highlight: true,
        },
        {
            label: 'Schoten',
            value: stats.totalShots,
        },
        {
            label: 'Op doel',
            value: stats.shotsOnTarget,
            suffix: stats.totalShots ? `/ ${stats.totalShots}` : undefined,
        },
        {
            label: 'Sleutelpasses',
            value: stats.keyPasses,
        },
        {
            label: 'Geslaagde dribbels',
            value: stats.dribblesSuccess,
            suffix: stats.dribblesAttempts
                ? `/ ${stats.dribblesAttempts}`
                : undefined,
        },
        {
            label: 'Gepasseerd',
            value: stats.dribblesPast,
        },
        {
            label: 'Penalty’s gescoord',
            value: stats.penaltiesScored,
        },
        {
            label: 'Penalty’s gemist',
            value: stats.penaltiesMissed,
        },
    ];

    return (
        <PlayerStatGrid
            title="Aanvallend"
            icon={<TrendingUp className="size-5" />}
            items={items}
        />
    );
}
