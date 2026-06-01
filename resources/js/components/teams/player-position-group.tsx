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
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black tracking-wide text-blue-950 uppercase">
                        {group.label}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
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
