import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
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
        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-cyan-200 hover:bg-white">
            <div className="relative shrink-0">
                <Avatar className="size-16 rounded-xl border border-white shadow-sm ring-1 ring-slate-200">
                    {player.photo ? (
                        <AvatarImage
                            src={player.photo}
                            alt={`${playerName} photo`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="rounded-xl bg-blue-950 text-sm font-black text-white">
                        {fallbackLabel}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -right-1 -bottom-1 flex min-w-6 items-center justify-center rounded-full border border-white bg-cyan-500 px-1.5 text-[10px] font-black text-blue-950 shadow-sm">
                    {player.number ?? '-'}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className="truncate font-black text-blue-950"
                    title={playerName}
                >
                    {playerName}
                </p>
                <p className="truncate text-sm font-bold text-slate-500">
                    {formatPositionLabel(player.position)}
                </p>
                <p
                    className="truncate text-xs font-medium text-slate-400"
                    title={player.country ?? undefined}
                >
                    {player.country ?? 'Country TBC'}
                </p>
            </div>
        </div>
    );
}
