import { CalendarDays, Flag, Hash, MapPin } from 'lucide-react';
import TeamInfoItem from '@/components/teams/team-info-item';
import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamInfoCard({ team }: Props) {
    const foundedLabel = team.foundedAt ? String(team.foundedAt) : 'Onbekend';

    return (
        <section className="rounded-lg border border-[#29312c] bg-[#111513] p-5 sm:p-6">
            <p className="text-xs font-bold text-[#70b98e] uppercase">
                Kerngegevens
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#f3f4f1]">
                Over het team
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[#29312c] bg-[#29312c] sm:grid-cols-2">
                <TeamInfoItem
                    icon={<Hash />}
                    label="Code"
                    value={team.code ?? 'Onbekend'}
                />
                <TeamInfoItem
                    icon={<CalendarDays />}
                    label="Opgericht"
                    value={foundedLabel}
                />
                <TeamInfoItem
                    icon={<MapPin />}
                    label="Land"
                    value={team.country?.name ?? 'Onbekend'}
                />
                <TeamInfoItem
                    icon={<Flag />}
                    label="FIFA code"
                    value={team.country?.fifaCode ?? 'Onbekend'}
                />
            </div>
        </section>
    );
}
