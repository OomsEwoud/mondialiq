import { Link } from '@inertiajs/react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { show as showTeam } from '@/routes/teams';
import type { AiPerformancePageProps } from '@/types/ai-ranking';
import { rankingPercentage } from '@/utils/ai-ranking';

type BreakdownView = 'team' | 'type' | 'confidence';
const views: { value: BreakdownView; label: string }[] = [
    { value: 'team', label: 'Teams' },
    { value: 'type', label: 'Type' },
    { value: 'confidence', label: 'Confidence' },
];

export default function PerformanceBreakdowns({
    teams,
    types,
    confidence,
}: {
    teams: AiPerformancePageProps['teamPerformance'];
    types: AiPerformancePageProps['typePerformance'];
    confidence: AiPerformancePageProps['confidencePerformance'];
}) {
    const [view, setView] = useState<BreakdownView>('team');
    const [showAll, setShowAll] = useState(false);
    const headingId = useId();
    const panelId = useId();
    const rows = view === 'team' ? teams : view === 'type' ? types : confidence;
    const visibleRows = showAll ? rows : rows.slice(0, 10);

    return (
        <section aria-labelledby={headingId} className="min-w-0">
            <h2
                id={headingId}
                className="text-xl font-bold tracking-tight text-white"
            >
                Prestaties uitgesplitst
            </h2>
            <div
                role="group"
                aria-label="Uitsplitsing kiezen"
                className="mt-4 flex gap-1 border-b border-[#262c29]"
            >
                {views.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={view === option.value}
                        aria-controls={panelId}
                        onClick={() => {
                            setView(option.value);
                            setShowAll(false);
                        }}
                        className={cn(
                            'min-h-11 border-b-2 px-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none',
                            view === option.value
                                ? 'border-[#6fae88] text-[#a6d7b7]'
                                : 'border-transparent text-[#89928c] hover:text-white',
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <div id={panelId}>
                <p className="my-4 text-xs leading-5 text-[#89928c]">
                    {view === 'team'
                        ? 'Wedstrijdvoorspellingen waarin het team speelt. Eén wedstrijd kan bij beide teams meetellen.'
                        : view === 'type'
                          ? 'Alle types binnen de overige filters. Scorevoorspellingen kunnen ook een uitkomst bevatten.'
                          : 'Alle confidence-niveaus binnen de overige filters. Confidence is de inschatting vooraf, geen gemeten nauwkeurigheid.'}
                </p>
                {rows.length === 0 ? (
                    <p className="border-t border-[#262c29] py-8 text-sm text-[#949d97]">
                        Geen resultaten voor deze selectie.
                    </p>
                ) : (
                    <table className="w-full table-fixed text-left text-sm">
                        <caption className="sr-only">
                            AI-prestaties per{' '}
                            {
                                views.find((option) => option.value === view)
                                    ?.label
                            }
                        </caption>
                        <thead className="text-xs text-[#89928c]">
                            <tr>
                                <th
                                    scope="col"
                                    className="w-[48%] py-3 font-semibold"
                                >
                                    {
                                        views.find(
                                            (option) => option.value === view,
                                        )?.label
                                    }
                                </th>
                                <th
                                    scope="col"
                                    className="py-3 text-right font-semibold"
                                >
                                    Juist
                                </th>
                                <th
                                    scope="col"
                                    className="py-3 text-right font-semibold"
                                >
                                    Aantal
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-t border-[#262c29]"
                                >
                                    <th
                                        scope="row"
                                        className="py-4 pr-3 font-semibold break-words text-[#daddd9]"
                                    >
                                        {view === 'team' &&
                                        typeof row.id === 'number' ? (
                                            <Link
                                                href={showTeam.url(row.id)}
                                                className="inline-flex min-h-11 items-center hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                                            >
                                                {row.name}
                                            </Link>
                                        ) : (
                                            row.name
                                        )}
                                    </th>
                                    <td className="py-4 text-right font-semibold text-[#a6d7b7] tabular-nums">
                                        {rankingPercentage(row.accuracy)}
                                    </td>
                                    <td className="py-4 pl-2 text-right text-[#949d97] tabular-nums">
                                        {row.correctCount}/{row.evaluatedCount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {rows.length > 10 && (
                    <button
                        type="button"
                        onClick={() => setShowAll(!showAll)}
                        className="mt-2 min-h-11 rounded-md px-2 text-sm font-semibold text-[#9ecbad] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                    >
                        {showAll
                            ? 'Minder tonen'
                            : `Alle ${rows.length} teams tonen`}
                    </button>
                )}
            </div>
        </section>
    );
}
