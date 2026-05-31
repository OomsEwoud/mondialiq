import MatchLineupPlayerItem from '@/components/matches/details/match-lineup-player-item';
import type { MatchDetailsLineupPlayer } from '@/types/match-details';
import { sortLineupPlayersByPosition } from '@/utils/match-lineup';

type Props = {
    title: string;
    players: MatchDetailsLineupPlayer[];
    isStarting?: boolean;
};

export default function MatchLineupPlayerGroup({
    title,
    players,
    isStarting = false,
}: Props) {
    const sortedPlayers = sortLineupPlayersByPosition(players);

    return (
        <div>
            <h4 className="mb-2 text-[11px] font-black tracking-wide text-slate-400 uppercase">
                {title}
            </h4>
            {sortedPlayers.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {sortedPlayers.map((player) => (
                        <MatchLineupPlayerItem
                            key={player.id}
                            player={player}
                            isStarting={isStarting}
                        />
                    ))}
                </div>
            ) : (
                <p className="rounded-md border border-dashed border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                    No players listed.
                </p>
            )}
        </div>
    );
}
