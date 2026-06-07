import { GroupStandingsTable } from '@/components/groups/group-standings-table';
import StandingsExplanationTrigger from '@/components/groups/standings-explanation-trigger';
import type { WorldCupGroup } from '@/types/group';

interface Props {
    group: WorldCupGroup;
    onExplain: () => void;
}

export default function GroupPanel({ group, onExplain }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-sm sm:p-6">
            <header className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                        Standings
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        {group.name}
                    </h2>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                    <p className="text-sm font-semibold text-slate-600 sm:text-sm">
                        Top two teams advance
                    </p>
                    <StandingsExplanationTrigger onClick={onExplain} />
                </div>
            </header>

            <GroupStandingsTable teams={group.teams} />
        </section>
    );
}
