import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import CompetitionController from '@/actions/App/Http/Controllers/Pages/CompetitionController';
import PageHead from '@/components/seo/page-head';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import type { CompetitionSummary } from '@/types/competition';

export default function CompetitionsIndex({
    competitions,
}: {
    competitions: CompetitionSummary[];
}) {
    const domestic = competitions.filter(
        (competition) => competition.region === 'domestic',
    );
    const international = competitions.filter(
        (competition) => competition.region === 'international',
    );

    return (
        <>
            <PageHead
                title="Competities"
                description="Ontdek voetbalcompetities, programma’s, standen en beschikbare statistieken."
            />
            <header className="mb-12 max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.16em] text-[#6fae88] uppercase">
                    Voetbaldata
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                    Competities
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#949d97]">
                    Volg wedstrijden, standen en statistieken per competitie.
                </p>
            </header>

            {competitions.length > 0 ? (
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                    {domestic.length > 0 && (
                        <CompetitionSection
                            title="Binnenlandse competities"
                            competitions={domestic}
                        />
                    )}
                    {international.length > 0 && (
                        <CompetitionSection
                            title="Internationale competities"
                            competitions={international}
                        />
                    )}
                </div>
            ) : (
                <div className="border-y border-[#262c29] py-12">
                    <h2 className="text-lg font-bold text-white">
                        Nog geen competities beschikbaar
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#949d97]">
                        Zodra wedstrijd- of standgegevens zijn ingeladen,
                        verschijnen ze hier.
                    </p>
                </div>
            )}
        </>
    );
}

function CompetitionSection({
    title,
    competitions,
}: {
    title: string;
    competitions: CompetitionSummary[];
}) {
    return (
        <section aria-labelledby={`section-${title}`}>
            <h2
                id={`section-${title}`}
                className="border-b border-[#343b37] pb-3 text-xs font-semibold tracking-[0.13em] text-[#949d97] uppercase"
            >
                {title}
            </h2>
            <ul>
                {competitions.map((competition) => (
                    <li key={competition.id}>
                        <Link
                            href={CompetitionController.url(competition.id)}
                            className="group flex min-h-20 items-center gap-4 border-b border-[#262c29] py-4 focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                        >
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f3f4f1] p-2">
                                <ImageWithFallback
                                    src={competition.logoUrl ?? undefined}
                                    alt=""
                                    className="size-full object-contain"
                                />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-[#f3f4f1] transition-colors group-hover:text-[#9ecbad]">
                                    {competition.name}
                                </span>
                                <span className="mt-1 block text-xs text-[#949d97]">
                                    {[
                                        competition.country,
                                        competition.season
                                            ? `Seizoen ${competition.season}`
                                            : null,
                                        competition.teamsCount
                                            ? `${competition.teamsCount} teams`
                                            : null,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </span>
                            </span>
                            <span className="hidden text-right text-xs leading-5 text-[#949d97] sm:block">
                                {competition.currentRound && (
                                    <span className="block">
                                        {competition.currentRound}
                                    </span>
                                )}
                                {competition.upcomingMatchesCount !== null &&
                                    competition.upcomingMatchesCount > 0 && (
                                        <span className="block">
                                            {competition.upcomingMatchesCount}{' '}
                                            komende wedstrijden
                                        </span>
                                    )}
                            </span>
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-4 shrink-0 text-[#737c76] transition-colors group-hover:text-[#9ecbad]"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
