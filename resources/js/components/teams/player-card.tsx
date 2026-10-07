import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
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
            className="group flex min-h-[6.25rem] min-w-0 items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3.5 transition-colors hover:border-border-strong hover:bg-surface-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            <div className="relative shrink-0">
                <Avatar className="size-[3.75rem] rounded-lg border border-border-strong bg-surface">
                    {player.photo ? (
                        <AvatarImage
                            src={player.photo}
                            alt={`Foto van ${playerName}`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-surface-interactive text-sm font-bold text-text-secondary">
                        {fallbackLabel}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -right-2 -bottom-1 flex size-6 items-center justify-center rounded-full border border-[#3a403c] bg-[#202421] text-[10px] font-bold text-[#d0d5d1]">
                    {player.number ?? '–'}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className="truncate text-[15px] font-bold text-foreground transition-colors group-hover:text-foreground"
                    title={playerName}
                >
                    {playerName}
                </p>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-border-strong bg-surface-interactive px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                        {formatPositionLabel(player.position)}
                    </span>
                    {player.country ? (
                        <span
                            className="truncate text-xs font-medium text-[#7f8b83]"
                            title={player.country}
                        >
                            {player.country}
                        </span>
                    ) : null}
                </div>
            </div>
            <ArrowUpRight
                className="size-4 shrink-0 self-start text-text-muted transition-colors group-hover:text-positive"
                aria-hidden="true"
            />
        </Link>
    );
}
