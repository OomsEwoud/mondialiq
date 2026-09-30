import { CalendarDays, Flag, UserRound } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import type { TeamDetailsCoach } from '@/types/team-details';
import { getPersonInitials } from '@/utils/team-players';

interface Props {
    coach: TeamDetailsCoach | null;
}

export default function TeamCoachCard({ coach }: Props) {
    return (
        <section className="rounded-lg border border-[#29312c] bg-[#111513] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-bold text-[#70b98e] uppercase">
                        Technische staf
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-[#f3f4f1]">
                        Bondscoach
                    </h2>
                </div>
                <span className="rounded-sm border border-[#343d37] bg-[#171c19] px-2.5 py-1 text-xs font-bold text-[#89928c]">
                    Hoofdcoach
                </span>
            </div>
            {coach ? (
                <div className="flex min-w-0 items-center gap-4 rounded-md border border-[#29312c] bg-[#0d110f] p-4">
                    <Avatar className="size-20 rounded-md border border-[#343d37]">
                        {coach.photo ? (
                            <AvatarImage
                                src={coach.photo}
                                alt={`Foto van ${coach.name}`}
                                className="object-cover"
                            />
                        ) : null}
                        <AvatarFallback className="rounded-md bg-[#1b2b21] text-lg font-bold text-[#8fd0a8]">
                            {getPersonInitials(coach.name) || (
                                <UserRound className="size-8" />
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p
                            className="truncate text-xl font-bold text-[#f3f4f1]"
                            title={coach.name}
                        >
                            {coach.name}
                        </p>
                        <p className="text-sm font-bold text-[#89928c]">
                            Bondscoach
                        </p>
                        <div className="mt-3 grid gap-2 text-xs text-[#7f8882] sm:text-sm">
                            <span className="flex min-w-0 items-center gap-2">
                                <Flag className="size-4 shrink-0 text-[#70b98e]" />
                                <span className="truncate">
                                    {coach.country ?? 'Nationaliteit onbekend'}
                                </span>
                            </span>
                            {coach.birthDate ? (
                                <span className="flex min-w-0 items-center gap-2">
                                    <CalendarDays className="size-4 shrink-0 text-[#70b98e]" />
                                    <span>Geboren op {coach.birthDate}</span>
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="rounded-md border border-dashed border-[#343d37] bg-[#0d110f] p-4 text-sm font-medium text-[#7f8882]">
                    Nog geen informatie over de bondscoach beschikbaar.
                </p>
            )}
        </section>
    );
}
