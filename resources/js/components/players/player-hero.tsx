import { Calendar, Flag, MapPin, Shield, Shirt } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { Badge } from '@/components/ui/feedback/badge';
import type { PlayerDetails } from '@/types/player-details';
import { getPersonInitials } from '@/utils/team-players';

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
            label: player.position,
        },
        {
            icon: <Flag className="size-3.5" />,
            label: player.country?.name,
        },
        {
            icon: <Calendar className="size-3.5" />,
            label: player.birthDate
                ? `${player.birthDate}${player.age ? ` · ${player.age} years` : ''}`
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
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-white/10 bg-slate-900 p-5 text-white sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="relative shrink-0">
                            <Avatar className="size-22 rounded-2xl border-2 border-white/20 shadow-lg sm:size-24">
                                {player.photo ? (
                                    <AvatarImage
                                        src={player.photo}
                                        alt={`${player.name} photo`}
                                        className="object-cover"
                                    />
                                ) : null}
                                <AvatarFallback className="rounded-2xl bg-blue-950 text-2xl font-bold text-white">
                                    {fallbackLabel}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold tracking-wide text-cyan-300 uppercase">
                                Player profile
                            </p>
                            <h1
                                className="truncate text-3xl font-bold text-white sm:text-4xl"
                                title={player.name}
                            >
                                {player.name}
                            </h1>
                            {player.country?.name ? (
                                <p className="mt-1 truncate text-sm font-bold text-cyan-100">
                                    {player.country.name}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                        {player.country?.flag ? (
                            <img
                                src={player.country.flag}
                                alt={player.country.name}
                                className="h-11 w-16 shrink-0 rounded-xl border border-white/30 object-cover shadow-sm"
                            />
                        ) : null}
                        {player.number ? (
                            <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white">
                                #{player.number}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>

            {visibleMetadata.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-4 sm:p-5">
                    {visibleMetadata.map((item) => (
                        <Badge
                            key={item.label}
                            variant="outline"
                            className="gap-1.5 rounded-full border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-3 py-1.5 font-bold text-slate-600 shadow-sm [&_svg]:text-slate-600"
                        >
                            {item.icon}
                            <span className="max-w-44 truncate">
                                {item.label}
                            </span>
                        </Badge>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
