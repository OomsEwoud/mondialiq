import { Link } from '@inertiajs/react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { show as showPlayer } from '@/routes/players';
import type { TeamDetailsPlayer } from '@/types/team-details';
import {
    formatPositionLabel,
    getPersonInitials,
    getPlayerDisplayName,
} from '@/utils/team-players';

interface Props {
    player: TeamDetailsPlayer;
}

export default function PlayerCard({ player }: Props) {
    const playerName = getPlayerDisplayName(player);
    const fallbackLabel =
        getPersonInitials(player.name) || player.number || '-';

    return (
        <Link
            href={showPlayer.url(player.id)}
            className="flex min-h-28 min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-3 shadow-lg shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
        >
            <div className="relative shrink-0">
                <Avatar className="size-16 rounded-2xl border border-white shadow-sm ring-1 ring-slate-200">
                    {player.photo ? (
                        <AvatarImage
                            src={player.photo}
                            alt={`${playerName} photo`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="rounded-2xl bg-blue-950 text-sm font-bold text-white">
                        {fallbackLabel}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -right-2 -bottom-2 flex min-w-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 px-2 py-1 text-xs font-bold text-white shadow-md shadow-sm">
                    #{player.number ?? '-'}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className="truncate text-base font-bold text-slate-900"
                    title={playerName}
                >
                    {playerName}
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-600">
                    {formatPositionLabel(player.position)}
                </p>
                <p
                    className="mt-1 truncate text-xs font-medium text-slate-400"
                    title={player.country ?? undefined}
                >
                    {player.country ?? 'Country TBC'}
                </p>
            </div>
        </Link>
    );
}
