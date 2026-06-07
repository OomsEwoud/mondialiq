import { CalendarDays, Flag, Hash, MapPin } from 'lucide-react';
import TeamInfoItem from '@/components/teams/team-info-item';
import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamInfoCard({ team }: Props) {
    const foundedLabel = team.foundedAt ? String(team.foundedAt) : 'TBC';

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">Team info</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TeamInfoItem
                    icon={<Hash />}
                    label="Code"
                    value={team.code ?? 'TBC'}
                />
                <TeamInfoItem
                    icon={<CalendarDays />}
                    label="Founded"
                    value={foundedLabel}
                />
                <TeamInfoItem
                    icon={<MapPin />}
                    label="Country"
                    value={team.country?.name ?? 'TBC'}
                />
                <TeamInfoItem
                    icon={<Flag />}
                    label="FIFA code"
                    value={team.country?.fifaCode ?? 'TBC'}
                />
            </div>
        </section>
    );
}
