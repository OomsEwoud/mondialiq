import { UserRound } from 'lucide-react';
import type { TeamDetailsCoach } from '@/types/team-details';

interface Props {
    coach: TeamDetailsCoach | null;
}

export default function TeamCoachCard({ coach }: Props) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black text-blue-950">Coach</h2>
            {coach ? (
                <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-4">
                    {coach.photo ? (
                        <img
                            src={coach.photo}
                            alt={coach.name}
                            className="h-20 w-20 rounded-lg object-cover"
                        />
                    ) : (
                        <span className="flex h-20 w-20 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <UserRound className="h-8 w-8" />
                        </span>
                    )}
                    <div className="min-w-0">
                        <p className="truncate text-xl font-black text-blue-950">
                            {coach.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {coach.country ?? 'Country TBC'}
                        </p>
                        <p className="text-sm text-slate-400">
                            Born {coach.birthDate ?? 'TBC'}
                        </p>
                    </div>
                </div>
            ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    Coach information is not available yet.
                </p>
            )}
        </section>
    );
}
