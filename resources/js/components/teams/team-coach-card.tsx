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
        <section className="rounded-xl border border-border-subtle bg-surface p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
                <div>
                    <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                        Technische staf
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-foreground">
                        Bondscoach
                    </h2>
                </div>
            </div>
            {coach ? (
                <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border-subtle bg-background p-3">
                    <Avatar className="size-14 rounded-lg border border-border-strong">
                        {coach.photo ? (
                            <AvatarImage
                                src={coach.photo}
                                alt={`Foto van ${coach.name}`}
                                className="object-cover"
                            />
                        ) : null}
                        <AvatarFallback className="rounded-md bg-surface-interactive text-lg font-bold text-text-secondary">
                            {getPersonInitials(coach.name) || (
                                <UserRound className="size-8" />
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p
                            className="truncate text-xl font-bold text-foreground"
                            title={coach.name}
                        >
                            {coach.name}
                        </p>
                        <p className="text-sm font-bold text-muted-foreground">
                            Bondscoach
                        </p>
                        <div className="mt-3 grid gap-2 text-xs text-text-muted sm:text-sm">
                            <span className="flex min-w-0 items-center gap-2">
                                <Flag className="size-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">
                                    {coach.country ?? 'Nationaliteit onbekend'}
                                </span>
                            </span>
                            {coach.birthDate ? (
                                <span className="flex min-w-0 items-center gap-2">
                                    <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                                    <span>Geboren op {coach.birthDate}</span>
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="rounded-md border border-dashed border-border-strong bg-surface p-4 text-sm font-medium text-text-muted">
                    Nog geen informatie over de bondscoach beschikbaar.
                </p>
            )}
        </section>
    );
}
