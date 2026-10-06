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
                className="text-xl font-bold tracking-tight text-white"
            >
                Competitieranglijst
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#89928c]">
                Waar MondialiQ AI het nauwkeurigst voorspelt, binnen deze
                selectie.
            </p>
            {competitions.length === 0 ? (
                <p className="mt-6 border-y border-[#262c29] py-8 text-sm text-[#949d97]">
                    Nog geen competitieprestaties beschikbaar. Probeer een
                    ruimere selectie.
                </p>
            ) : (
                <ol className="mt-6 border-b border-[#262c29]">
                    {competitions.map((competition, index) => (
                        <li
                            key={competition.id}
                            className="border-t border-[#262c29]"
                        >
                            <Link
                                href={show.url(competition.id)}
                                className="group flex min-h-20 items-center gap-4 rounded-sm py-4 focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                            >
                                <span className="w-5 shrink-0 text-xs font-semibold text-[#89928c] tabular-nums">
                                    {competition.accuracy === null
                                        ? '—'
                                        : (index + 1)
                                              .toString()
                                              .padStart(2, '0')}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold break-words text-[#daddd9] group-hover:text-white">
                                        {competition.name}
                                    </h3>
                                    <p className="mt-1 text-xs text-[#89928c]">
                                        {competition.correctCount} /{' '}
                                        {competition.evaluatedCount} juist
                                    </p>
                                    <div
                                        aria-hidden="true"
                                        className="mt-3 h-1 rounded-full bg-[#262c29]"
                                    >
                                        <div
                                            className="h-full rounded-full bg-[#6fae88]"
                                            style={{
                                                width: `${competition.accuracy ?? 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="shrink-0 text-lg font-bold text-white tabular-nums">
                                    {rankingPercentage(competition.accuracy)}
                                </span>
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-4 shrink-0 text-[#89928c] group-hover:text-[#9ecbad]"
                                />
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
            <p className="mt-4 text-xs leading-5 text-[#89928c]">
                De steekproefgrootte staat bij elke competitie. Een hoge score
                over weinig wedstrijden biedt minder zekerheid.
            </p>
        </section>
    );
}
