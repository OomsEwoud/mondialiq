import { CalendarDays, Flag, Hash, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamInfoCard({ team }: Props) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black text-blue-950">Team info</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                    icon={<Hash />}
                    label="Code"
                    value={team.code ?? 'TBC'}
                />
                <InfoItem
                    icon={<CalendarDays />}
                    label="Founded"
                    value={team.foundedAt ? String(team.foundedAt) : 'TBC'}
                />
                <InfoItem
                    icon={<MapPin />}
                    label="Country"
                    value={team.country?.name ?? 'TBC'}
                />
                <InfoItem
                    icon={<Flag />}
                    label="FIFA code"
                    value={team.country?.fifaCode ?? 'TBC'}
                />
            </div>
        </section>
    );
}

interface InfoItemProps {
    icon: ReactNode;
    label: string;
    value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="truncate text-sm font-bold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}
