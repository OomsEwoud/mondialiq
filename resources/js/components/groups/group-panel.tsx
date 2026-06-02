import { GroupStandingsTable } from '@/components/groups/group-standings-table';
import QualificationProbability from '@/components/groups/qualification-probability';
import type { WorldCupGroup } from '@/types/group';

interface Props {
    group: WorldCupGroup;
}

export default function GroupPanel({ group }: Props) {
    return (
        <section className="rounded-[1.9rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.97))] p-4 shadow-xl shadow-cyan-950/8 sm:p-6">
            <header className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
                        Standings
                    </p>
                    <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        {group.name}
                    </h2>
                </div>
                <p className="text-sm font-semibold text-slate-500 sm:text-sm">
                    Top two teams advance
                </p>
            </header>

            <GroupStandingsTable teams={group.teams} />
            <QualificationProbability teams={group.teams} />
        </section>
    );
}
