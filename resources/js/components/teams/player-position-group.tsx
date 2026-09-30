import PlayerCard from '@/components/teams/player-card';
import type { PlayerPositionGroup } from '@/utils/team-players';

interface Props {
    group: PlayerPositionGroup;
    compactHeader: boolean;
}

export default function PlayerPositionGroup({ group, compactHeader }: Props) {
    return (
        <section>
            {!compactHeader && (
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#29312c] pb-3">
                    <h3 className="text-sm font-bold text-[#daddd9] uppercase">
                        {group.label}
                    </h3>
                    <span className="rounded-sm border border-[#343d37] bg-[#171c19] px-2 py-0.5 text-xs font-bold text-[#89928c]">
                        {group.players.length}
                    </span>
                </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.players.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                ))}
            </div>
        </section>
    );
}
