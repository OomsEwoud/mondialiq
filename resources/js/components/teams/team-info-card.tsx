import { CalendarDays, Flag, Hash, MapPin } from 'lucide-react';
import TeamInfoItem from '@/components/teams/team-info-item';
import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamInfoCard({ team }: Props) {
    const foundedLabel = team.foundedAt ? String(team.foundedAt) : 'Onbekend';

    return (
        <section className="rounded-xl border border-[#292e2b] bg-[#101211] p-5 sm:p-6">
            <p className="text-[11px] font-bold tracking-[0.14em] text-[#929a95] uppercase">
                Teamprofiel
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#f3f4f1]">
                In één oogopslag
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
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
