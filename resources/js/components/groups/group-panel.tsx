import GroupStandingsTable from '@/components/groups/group-standings-table';
import QualificationProbability from '@/components/groups/qualification-probability';
import type { WorldCupGroup } from '@/types/group';

interface Props {
    group: WorldCupGroup;
}

export default function GroupPanel({ group }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-6">
            <header className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-black tracking-widest text-cyan-600 uppercase">
                        Standings
                    </p>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                        {group.name}
                    </h2>
                </div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    Top two teams advance
                </p>
            </header>

            <GroupStandingsTable teams={group.teams} />
            <QualificationProbability teams={group.teams} />
        </section>
    );
}
