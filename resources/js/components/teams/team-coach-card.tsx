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
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black tracking-widest text-cyan-500 uppercase">
                        Staff
                    </p>
                    <h2 className="text-lg font-black text-blue-950">Coach</h2>
                </div>
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
                    Head coach
                </span>
            </div>
            {coach ? (
                <div className="flex min-w-0 items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <Avatar className="size-20 rounded-xl border border-white shadow-sm ring-1 ring-slate-200">
                        {coach.photo ? (
                            <AvatarImage
                                src={coach.photo}
                                alt={`${coach.name} photo`}
                                className="object-cover"
                            />
                        ) : null}
                        <AvatarFallback className="rounded-xl bg-blue-950 text-lg font-black text-white">
                            {getPersonInitials(coach.name) || (
                                <UserRound className="size-8" />
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p
                            className="truncate text-xl font-black text-blue-950"
                            title={coach.name}
                        >
                            {coach.name}
                        </p>
                        <p className="text-sm font-bold text-cyan-600">
                            Head coach
                        </p>
                        <div className="mt-3 grid gap-2 text-sm text-slate-500">
                            <span className="flex min-w-0 items-center gap-2">
                                <Flag className="size-4 shrink-0 text-slate-400" />
                                <span className="truncate">
                                    {coach.country ?? 'Nationality TBC'}
                                </span>
                            </span>
                            {coach.birthDate ? (
                                <span className="flex min-w-0 items-center gap-2">
                                    <CalendarDays className="size-4 shrink-0 text-slate-400" />
                                    <span className="truncate">
                                        Born {coach.birthDate}
                                    </span>
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                    No coach information available yet.
                </p>
            )}
        </section>
    );
}
