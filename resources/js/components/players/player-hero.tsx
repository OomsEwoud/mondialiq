import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import type { PlayerDetails } from '@/types/player-details';
import { formatPositionLabel, getPersonInitials } from '@/utils/team-players';

export default function PlayerHero({ player }: { player: PlayerDetails }) {
    return (
        <header className="flex items-center gap-5 sm:gap-7">
            <Avatar className="size-20 shrink-0 rounded-xl bg-surface-elevated sm:size-28">
                {player.photo && (
                    <AvatarImage
                        src={player.photo}
                        alt={player.name}
                        className="object-cover"
                    />
                )}
                <AvatarFallback className="rounded-xl bg-surface-elevated text-2xl font-semibold text-text-secondary">
                    {getPersonInitials(player.name)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    Spelersprofiel
                </p>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h1 className="text-3xl font-bold tracking-tight break-words sm:text-4xl">
                        {player.name}
                    </h1>
                    {player.number !== null && (
                        <span className="text-xl font-medium text-muted-foreground">
                            #{player.number}
                        </span>
                    )}
                </div>
                {player.teams.length > 0 && (
                    <p className="mt-2 text-sm font-medium text-text-secondary">
                        {player.teams.map((team) => team.name).join(' · ')}
                    </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                    {[
                        player.position
                            ? formatPositionLabel(player.position)
                            : null,
                        player.country?.name,
                    ]
                        .filter(Boolean)
                        .join(' · ')}
                </p>
                {player.birthDate && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {player.birthDate}
                        {player.age !== null ? ` · ${player.age} jaar` : ''}
                    </p>
                )}
            </div>
        </header>
    );
}
