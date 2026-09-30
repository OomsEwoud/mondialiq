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
            className="group flex min-h-24 min-w-0 items-center gap-3 rounded-lg border border-[#29312c] bg-[#111513] p-3 transition-colors hover:border-[#4b775d] hover:bg-[#141a16] focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
        >
            <div className="relative shrink-0">
                <Avatar className="size-16 rounded-md border border-[#343d37] bg-[#0d110f]">
                    {player.photo ? (
                        <AvatarImage
                            src={player.photo}
                            alt={`Foto van ${playerName}`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="rounded-md bg-[#1b2b21] text-sm font-bold text-[#8fd0a8]">
                        {fallbackLabel}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -right-2 -bottom-1 flex min-w-8 items-center justify-center rounded-sm border border-[#4b775d] bg-[#17251d] px-1.5 py-0.5 text-[10px] font-bold text-[#8fd0a8]">
                    #{player.number ?? '-'}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className="truncate text-base font-bold text-[#f3f4f1] transition-colors group-hover:text-white"
                    title={playerName}
                >
                    {playerName}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-[#8fa097]">
                    {formatPositionLabel(player.position)}
                </p>
                <p
                    className="mt-1 truncate text-xs font-medium text-[#68716b]"
                    title={player.country ?? undefined}
                >
                    {player.country ?? 'Land onbekend'}
                </p>
            </div>
        </Link>
    );
}
