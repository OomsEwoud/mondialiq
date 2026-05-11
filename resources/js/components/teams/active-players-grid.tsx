import { UserRound } from 'lucide-react';
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

interface PlayerCardProps {
    player: TeamDetailsPlayer;
}

function PlayerCard({ player }: PlayerCardProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
            {player.photo ? (
                <img
                    src={player.photo}
                    alt={player.name ?? 'Player'}
                    className="h-14 w-14 rounded-lg object-cover"
                />
            ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <UserRound className="h-6 w-6" />
                </span>
            )}
            <div className="min-w-0">
                <p className="truncate font-black text-blue-950">
                    {player.name ?? 'Unknown player'}
                </p>
                <p className="text-sm font-medium text-slate-500">
                    {player.position ?? 'Position TBC'}
                </p>
                <p className="text-xs text-slate-400">
                    #{player.number ?? '-'} · {player.country ?? 'Country TBC'}
                </p>
            </div>
        </div>
    );
}
