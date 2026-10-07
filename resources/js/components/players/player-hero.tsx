import { Calendar, Flag, MapPin, Shield, Shirt } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import type { PlayerDetails } from '@/types/player-details';
import { formatPositionLabel, getPersonInitials } from '@/utils/team-players';

interface Props {
    player: PlayerDetails;
}

export default function PlayerHero({ player }: Props) {
    const fallbackLabel =
        getPersonInitials(player.name) || String(player.number ?? '-');

    const metadata = [
        {
            icon: <Shirt className="size-3.5" />,
            label: player.number ? `#${player.number}` : null,
        },
        {
            icon: <Shield className="size-3.5" />,
            label: player.position
                ? formatPositionLabel(player.position)
                : null,
        },
        {
            icon: <Flag className="size-3.5" />,
            label: player.country?.name,
        },
        {
            icon: <Calendar className="size-3.5" />,
            label: player.birthDate
                ? `${player.birthDate}${player.age ? ` · ${player.age} jaar` : ''}`
                : null,
        },
        {
            icon: <MapPin className="size-3.5" />,
            label:
                player.teams.length > 0
                    ? player.teams.map((t) => t.name).join(', ')
                    : null,
        },
    ];

    const visibleMetadata = metadata.filter((item) => item.label);

    return (
        <section className="border-b border-border-subtle pb-8 sm:pb-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-8">
                <Avatar className="size-32 shrink-0 rounded-lg border border-border-strong bg-crest-surface sm:size-40">
                    {player.photo ? (
                        <AvatarImage
                            src={player.photo}
                            alt={`Foto van ${player.name}`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-brand-subtle text-3xl font-black text-positive">
                        {fallbackLabel}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
                        <span className="size-1.5 rounded-full bg-primary" />
                        Spelersprofiel
                    </p>
                    <div className="mt-3 flex min-w-0 flex-wrap items-end gap-3">
                        <h1
                            className="min-w-0 text-5xl leading-none font-black text-foreground sm:text-7xl"
                            title={player.name}
                        >
                            {player.name}
                        </h1>
                        {player.number ? (
                            <span className="mb-1 rounded-sm border border-border-strong bg-brand-subtle px-2.5 py-1 text-xs font-bold text-positive sm:mb-2">
                                #{player.number}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                        {player.position
                            ? formatPositionLabel(player.position)
                            : 'Speler'}
                        {player.country?.name
                            ? ` · ${player.country.name}`
                            : ''}
                    </p>
                </div>
            </div>

            {visibleMetadata.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 border-y border-border-subtle sm:grid-cols-3 lg:grid-cols-5">
                    {visibleMetadata.map((item) => (
                        <div
                            key={item.label}
                            className="flex min-w-0 items-center gap-2 border-r border-border-subtle px-3 py-3 text-sm font-semibold text-text-secondary last:border-r-0 [&_svg]:shrink-0 [&_svg]:text-primary"
                        >
                            {item.icon}
                            <span className="max-w-44 truncate">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
