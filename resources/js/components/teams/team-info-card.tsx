import { CalendarDays, Flag, Hash, MapPin } from 'lucide-react';
import TeamInfoItem from '@/components/teams/team-info-item';
import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamInfoCard({ team }: Props) {
    const foundedLabel = team.foundedAt ? String(team.foundedAt) : 'TBC';

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-black text-blue-950">Team info</h2>
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
