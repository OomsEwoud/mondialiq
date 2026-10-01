import StandingsExplanationTrigger from '@/components/groups/standings-explanation-trigger';
import ThirdPlaceStandingsTable from '@/components/groups/third-place-standings-table';
import type { ThirdPlaceRanking } from '@/types/group';

interface Props {
    ranking: ThirdPlaceRanking;
    onExplain: () => void;
}

export default function ThirdPlacePanel({ ranking, onExplain }: Props) {
    return (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <header className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                        Best 3rd
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Best third-placed teams
                    </h2>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                    <p className="text-sm font-semibold text-muted-foreground sm:text-sm">
                        Top eight third-placed teams advance
                    </p>
                    <StandingsExplanationTrigger onClick={onExplain} />
                </div>
            </header>

            <p className="mb-5 text-sm font-medium text-muted-foreground sm:mb-6">
                The top eight third-placed teams advance to the Round of 32.
            </p>

            <ThirdPlaceStandingsTable teams={ranking.teams} />
        </section>
    );
}
