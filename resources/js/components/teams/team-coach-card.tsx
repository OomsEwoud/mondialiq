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
        <section className="rounded-[1.8rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-5 shadow-xl shadow-cyan-950/8">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black tracking-[0.18em] text-cyan-600 uppercase">
                        Staff
                    </p>
                    <h2 className="text-2xl font-black text-blue-950">Coach</h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    Head coach
                </span>
            </div>
            {coach ? (
                <div className="flex min-w-0 items-center gap-4 rounded-[1.4rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] p-4 shadow-sm shadow-cyan-950/5">
                    <Avatar className="size-20 rounded-2xl border border-white shadow-sm ring-1 ring-slate-200">
                        {coach.photo ? (
                            <AvatarImage
                                src={coach.photo}
                                alt={`${coach.name} photo`}
                                className="object-cover"
                            />
                        ) : null}
                        <AvatarFallback className="rounded-2xl bg-blue-950 text-lg font-black text-white">
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
                <p className="rounded-2xl border border-dashed border-cyan-100 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                    No coach information available yet.
                </p>
            )}
        </section>
    );
}
