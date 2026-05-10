import GroupStandingsTable from '@/components/groups/group-standings-table';
import QualificationProbability from '@/components/groups/qualification-probability';
import type { WorldCupGroup } from '@/types/group';

interface Props {
    group: WorldCupGroup;
}

export default function GroupPanel({ group }: Props) {
    return (
        <section className="rounded-b-lg border border-t-0 border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold text-cyan-600 uppercase">
                        Standings
                    </p>
                    <h2 className="text-2xl font-black text-blue-950 sm:text-3xl">
                        {group.name}
                    </h2>
                </div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    Top two teams advance
                </p>
            </div>

            <GroupStandingsTable teams={group.teams} />
            <QualificationProbability teams={group.teams} />
        </section>
    );
}
