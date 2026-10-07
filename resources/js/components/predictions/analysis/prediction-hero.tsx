import OutcomeDistribution from '@/components/predictions/analysis/outcome-distribution';
import type { OutcomeEstimate } from '@/types/prediction-analysis';

interface Props {
    homeTeam: string;
    awayTeam: string;
    score: string | null;
    outlook: string;
    estimates: OutcomeEstimate[];
}

export default function PredictionHero({
    homeTeam,
    awayTeam,
    score,
    outlook,
    estimates,
}: Props) {
    return (
        <section
            aria-labelledby="prediction-heading"
            className="rounded-xl border border-border bg-card px-5 py-6 sm:px-8 sm:py-8"
        >
            <div className="grid gap-7 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-10">
                <div>
                    <h2
                        id="prediction-heading"
                        className="text-sm font-medium text-muted-foreground"
                    >
                        AI-voorspelling
                    </h2>
                    {score ? (
                        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                            <span className="text-sm font-medium break-words text-foreground">
                                {homeTeam}
                            </span>
                            <p
                                aria-label={`Verwachte score: ${score}`}
                                className="text-4xl font-semibold tracking-tight whitespace-nowrap text-foreground tabular-nums sm:text-5xl"
                            >
                                {score}
                            </p>
                            <span className="text-right text-sm font-medium break-words text-foreground">
                                {awayTeam}
                            </span>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Nog geen score-inschatting beschikbaar.
                        </p>
                    )}
                    <p className="mt-5 text-center text-sm font-medium text-primary">
                        {outlook}
                    </p>
                </div>
                <div className="border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                    <OutcomeDistribution estimates={estimates} />
                </div>
            </div>
        </section>
    );
}
