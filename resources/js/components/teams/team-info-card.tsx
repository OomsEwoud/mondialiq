import { CalendarDays, Flag, Hash, MapPin } from 'lucide-react';
import TeamInfoItem from '@/components/teams/team-info-item';
import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamInfoCard({ team }: Props) {
    const foundedLabel = team.foundedAt ? String(team.foundedAt) : 'TBC';

    return (
        <section className="rounded-[1.8rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-5 shadow-xl shadow-cyan-950/8">
            <h2 className="mb-5 text-2xl font-black text-blue-950">Team info</h2>
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
