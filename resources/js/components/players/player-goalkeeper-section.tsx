import { ShieldCheck } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import PlayerStatGrid from './player-stat-grid';

interface Props {
    stats: PlayerDetailsSeasonStat;
}

export default function PlayerGoalkeeperSection({ stats }: Props) {
    const items = [
        {
            label: 'Saves',
            value: stats.saves,
            highlight: true,
        },
        {
            label: 'Goals conceded',
            value: stats.goalsConceded,
        },
        {
            label: 'Penalties saved',
            value: stats.penaltiesSaved,
            highlight: true,
        },
        {
            label: 'Penalties missed against',
            value: stats.penaltiesMissed,
        },
    ];

    return (
        <PlayerStatGrid
            title="Goalkeeping"
            icon={<ShieldCheck className="size-5 text-slate-700" />}
            items={items}
        />
    );
}
