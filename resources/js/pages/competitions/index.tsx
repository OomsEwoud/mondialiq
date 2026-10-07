import type { Errors } from '@inertiajs/core';
import { Link, router } from '@inertiajs/react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useState } from 'react';
import type * as React from 'react';
import CompetitionController from '@/actions/App/Http/Controllers/Pages/CompetitionController';
import CompetitionsController from '@/actions/App/Http/Controllers/Pages/CompetitionsController';
import CompetitionPagination from '@/components/competitions/competition-pagination';
import type { CompetitionPaginationLink } from '@/components/competitions/competition-pagination';
import PageHead from '@/components/seo/page-head';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { Button } from '@/components/ui/forms/button';
import type { CompetitionSummary } from '@/types/competition';

export default function CompetitionsIndex({
    domesticCompetitions,
    internationalCompetitions,
    search,
}: {
    domesticCompetitions: CompetitionPage;
    internationalCompetitions: CompetitionPage;
    search: string;
}) {
    const [query, setQuery] = useState(search);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const hasCompetitions =
        domesticCompetitions.total + internationalCompetitions.total > 0;

    const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedQuery = query.trim();
        setQuery(normalizedQuery);

        router.get(
            CompetitionsController.url(),
            normalizedQuery ? { search: normalizedQuery } : {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onStart: () => {
                    setSearching(true);
                    setSearchError(null);
                },
                onError: (errors: Errors) => {
                    setSearchError(
                        errors.search ??
                            'De zoekopdracht kon niet worden toegepast.',
                    );
                },
                onFinish: () => setSearching(false),
            },
        );
    };

    const clearSearch = () => {
        setQuery('');
        router.get(
            CompetitionsController.url(),
            {},
            {
                preserveScroll: true,
                replace: true,
                onStart: () => setSearching(true),
                onFinish: () => setSearching(false),
            },
        );
    };

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

            <form
                role="search"
                onSubmit={submitSearch}
                className="mb-8 flex max-w-xl flex-col gap-2 sm:flex-row"
            >
                <label htmlFor="competition-search" className="sr-only">
                    Zoek op competitie of land
                </label>
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#343b37] bg-[#111613] px-3.5 transition-colors focus-within:border-[#57ad78]">
                    <Search
                        aria-hidden="true"
                        className="size-4 shrink-0 text-[#737c76]"
                    />
                    <input
                        id="competition-search"
                        type="search"
                        name="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        maxLength={100}
                        placeholder="Competitie of land"
                        autoComplete="off"
                        className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#737c76] [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            aria-label="Zoekopdracht wissen"
                            className="rounded p-1 text-[#949d97] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                        >
                            <X aria-hidden="true" className="size-4" />
                        </button>
                    )}
                </div>
                <Button
                    type="submit"
                    disabled={searching}
                    className="h-11 shrink-0 bg-[#193526] px-4 text-[#c5e2ce] hover:bg-[#234532]"
                >
                    <Search aria-hidden="true" className="size-4 sm:hidden" />
                    <span>{searching ? 'Zoeken…' : 'Zoeken'}</span>
                </Button>
            </form>

            {searchError && (
                <p role="alert" className="-mt-5 mb-6 text-sm text-red-300">
                    {searchError}
                </p>
            )}

            {hasCompetitions ? (
                <div
                    aria-busy={searching}
                    className={`grid gap-12 transition-opacity motion-reduce:transition-none lg:grid-cols-2 lg:gap-16 ${searching ? 'opacity-60' : ''}`}
                >
                    {domesticCompetitions.total > 0 && (
                        <CompetitionSection
                            title="Binnenlandse competities"
                            competitions={domesticCompetitions.data}
                            pagination={domesticCompetitions.links}
                        />
                    )}
                    {internationalCompetitions.total > 0 && (
                        <CompetitionSection
                            title="Internationale competities"
                            competitions={internationalCompetitions.data}
                            pagination={internationalCompetitions.links}
                        />
                    )}
                </div>
            ) : search ? (
                <div role="status" className="border-y border-[#262c29] py-12">
                    <h2 className="text-lg font-bold text-white">
                        Geen competities gevonden
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#949d97]">
                        Geen resultaten voor “{search}”. Probeer een andere naam
                        of een ander land.
                    </p>
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="mt-4 text-sm font-semibold text-[#9ecbad] underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                    >
                        Wis zoekopdracht
                    </button>
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
    pagination,
}: {
    title: string;
    competitions: CompetitionSummary[];
    pagination: CompetitionPaginationLink[];
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
            <CompetitionPagination
                links={pagination}
                label={`${title} pagina’s`}
            />
        </section>
    );
}

type CompetitionPage = {
    data: CompetitionSummary[];
    links: CompetitionPaginationLink[];
    total: number;
};
