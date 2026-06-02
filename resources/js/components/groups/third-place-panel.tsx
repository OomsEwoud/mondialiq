import QualificationProbability from '@/components/groups/qualification-probability';
import ThirdPlaceStandingsTable from '@/components/groups/third-place-standings-table';
import type { ThirdPlaceRanking } from '@/types/group';

interface Props {
    ranking: ThirdPlaceRanking;
}

export default function ThirdPlacePanel({ ranking }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-6">
            <header className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-black tracking-widest text-cyan-600 uppercase">
                        Best 3rd
                    </p>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                        Best third-placed teams
                    </h2>
                </div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    Top eight third-placed teams advance
                </p>
            </header>

            <p className="mb-5 text-sm font-medium text-slate-500 sm:mb-6">
                The top eight third-placed teams advance to the Round of 32.
            </p>

            <ThirdPlaceStandingsTable teams={ranking.teams} />
            <QualificationProbability teams={ranking.teams} />
        </section>
    );
}
