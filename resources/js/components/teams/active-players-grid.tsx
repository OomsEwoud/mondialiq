import PlayerCard from '@/components/teams/player-card';
import type { TeamDetailsPlayer } from '@/types/team-details';

interface Props {
    players: TeamDetailsPlayer[];
}

export default function ActivePlayersGrid({ players }: Props) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-black text-blue-950">
                    Active players
                </h2>
                <span className="rounded-md bg-cyan-100 px-3 py-1 text-xs font-black text-blue-950">
                    {players.length}
                </span>
            </div>

            {players.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {players.map((player) => (
                        <PlayerCard key={player.id} player={player} />
                    ))}
                </div>
            ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No active players available yet.
                </p>
            )}
        </section>
    );
}
