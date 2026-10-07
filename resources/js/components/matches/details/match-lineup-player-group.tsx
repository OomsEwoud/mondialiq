import MatchLineupPlayerItem from '@/components/matches/details/match-lineup-player-item';
import type { MatchDetailsLineupPlayer } from '@/types/match-details';
import { sortLineupPlayersByPosition } from '@/utils/match-lineup';

type Props = {
    title: string;
    players: MatchDetailsLineupPlayer[];
    teamName: string;
    isStarting?: boolean;
};

export default function MatchLineupPlayerGroup({
    title,
    players,
    teamName,
    isStarting = false,
}: Props) {
    const sortedPlayers = sortLineupPlayersByPosition(players);

    return (
        <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
                {title}
            </h4>
            {sortedPlayers.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {sortedPlayers.map((player) => (
                        <MatchLineupPlayerItem
                            key={player.id}
                            player={player}
                            teamName={teamName}
                            isStarting={isStarting}
                        />
                    ))}
                </div>
            ) : (
                <p className="px-1 py-2 text-sm text-muted-foreground">
                    No players listed.
                </p>
            )}
        </div>
    );
}
