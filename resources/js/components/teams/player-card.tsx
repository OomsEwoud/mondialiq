import { UserRound } from 'lucide-react';
import type { TeamDetailsPlayer } from '@/types/team-details';

interface Props {
    player: TeamDetailsPlayer;
}

export default function PlayerCard({ player }: Props) {
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
                    #{player.number ?? '-'} &middot;{' '}
                    {player.country ?? 'Country TBC'}
                </p>
            </div>
        </div>
    );
}
