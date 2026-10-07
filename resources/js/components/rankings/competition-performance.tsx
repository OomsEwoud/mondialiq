import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { show } from '@/routes/competitions';
import type { AiPerformancePageProps } from '@/types/ai-ranking';
import { rankingPercentage } from '@/utils/ai-ranking';

export default function CompetitionPerformance({
    competitions,
}: {
    competitions: AiPerformancePageProps['competitionPerformance'];
}) {
    return (
        <section
            aria-labelledby="competition-performance-heading"
            className="min-w-0"
        >
            <h2
                id="competition-performance-heading"
                className="text-xl font-bold tracking-tight text-foreground"
            >
                Competitieranglijst
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Waar MondialiQ AI het nauwkeurigst voorspelt, binnen deze
                selectie.
            </p>
            {competitions.length === 0 ? (
                <p className="mt-6 border-y border-border-subtle py-8 text-sm text-muted-foreground">
                    Nog geen competitieprestaties beschikbaar. Probeer een
                    ruimere selectie.
                </p>
            ) : (
                <ol className="mt-6 border-b border-border-subtle">
                    {competitions.map((competition, index) => (
                        <li
                            key={competition.id}
                            className="border-t border-border-subtle"
                        >
                            <Link
                                href={show.url(competition.id)}
                                className="group flex min-h-20 items-center gap-4 rounded-sm py-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <span className="w-5 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                                    {competition.accuracy === null
                                        ? '—'
                                        : (index + 1)
                                              .toString()
                                              .padStart(2, '0')}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold break-words text-foreground group-hover:text-foreground">
                                        {competition.name}
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {competition.correctCount} /{' '}
                                        {competition.evaluatedCount} juist
                                    </p>
                                    <div
                                        aria-hidden="true"
                                        className="mt-3 h-1 rounded-full bg-border-subtle"
                                    >
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{
                                                width: `${competition.accuracy ?? 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="shrink-0 text-lg font-bold text-foreground tabular-nums">
                                    {rankingPercentage(competition.accuracy)}
                                </span>
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-4 shrink-0 text-muted-foreground group-hover:text-positive"
                                />
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
                De steekproefgrootte staat bij elke competitie. Een hoge score
                over weinig wedstrijden biedt minder zekerheid.
            </p>
        </section>
    );
}
