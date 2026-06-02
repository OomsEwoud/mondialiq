import QualificationProbability from '@/components/groups/qualification-probability';
import StandingsExplanationTrigger from '@/components/groups/standings-explanation-trigger';
import ThirdPlaceStandingsTable from '@/components/groups/third-place-standings-table';
import type { ThirdPlaceRanking } from '@/types/group';

interface Props {
    ranking: ThirdPlaceRanking;
    onExplain: () => void;
}

export default function ThirdPlacePanel({ ranking, onExplain }: Props) {
    return (
        <section className="rounded-[1.9rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.97))] p-4 shadow-xl shadow-cyan-950/8 sm:p-6">
            <header className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
                        Best 3rd
                    </p>
                    <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        Best third-placed teams
                    </h2>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                    <p className="text-sm font-semibold text-slate-500 sm:text-sm">
                        Top eight third-placed teams advance
                    </p>
                    <StandingsExplanationTrigger onClick={onExplain} />
                </div>
            </header>

            <p className="mb-5 text-sm font-medium text-slate-600 sm:mb-6">
                The top eight third-placed teams advance to the Round of 32.
            </p>

            <ThirdPlaceStandingsTable teams={ranking.teams} />
            <QualificationProbability teams={ranking.teams} />
        </section>
    );
}
