import { ShieldCheck } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';
import PlayerStatGrid from './player-stat-grid';

interface Props {
    stats: PlayerDetailsSeasonStat;
}

export default function PlayerGoalkeeperSection({ stats }: Props) {
    const items = [
        {
            label: 'Reddingen',
            value: stats.saves,
            highlight: true,
        },
        {
            label: 'Tegendoelpunten',
            value: stats.goalsConceded,
        },
        {
            label: 'Penalty’s gestopt',
            value: stats.penaltiesSaved,
            highlight: true,
        },
        {
            label: 'Penalty’s naast',
            value: stats.penaltiesMissed,
        },
    ];

    return (
        <PlayerStatGrid
            title="Doelverdediging"
            icon={<ShieldCheck className="size-5" />}
            items={items}
        />
    );
}
