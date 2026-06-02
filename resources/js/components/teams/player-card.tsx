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
        <div className="flex min-h-28 min-w-0 items-center gap-3 rounded-[1.45rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-3 shadow-lg shadow-cyan-950/6 transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-xl">
            <div className="relative shrink-0">
                <Avatar className="size-16 rounded-2xl border border-white shadow-sm ring-1 ring-slate-200">
                    {player.photo ? (
                        <AvatarImage
                            src={player.photo}
                            alt={`${playerName} photo`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="rounded-2xl bg-blue-950 text-sm font-black text-white">
                        {fallbackLabel}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -right-2 -bottom-2 flex min-w-9 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#16255f_0%,#21326e_100%)] px-2 py-1 text-xs font-black text-white shadow-md shadow-blue-950/20">
                    #{player.number ?? '-'}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className="truncate text-base font-black text-blue-950"
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
        </div>
    );
}
