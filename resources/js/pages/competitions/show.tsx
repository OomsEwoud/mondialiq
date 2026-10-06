import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type * as React from 'react';
import CompetitionController from '@/actions/App/Http/Controllers/Pages/CompetitionController';
import CompetitionsController from '@/actions/App/Http/Controllers/Pages/CompetitionsController';
import PredictionDetailsController from '@/actions/App/Http/Controllers/Pages/PredictionDetailsController';
import CompetitionFixtureList from '@/components/competitions/competition-fixture-list';
import CompetitionStandings from '@/components/competitions/competition-standings';
import CompetitionTabs from '@/components/competitions/competition-tabs';
import CompetitionTeams from '@/components/competitions/competition-teams';
import StandingsExplanationModal from '@/components/groups/standings-explanation-modal';
import StandingsExplanationTrigger from '@/components/groups/standings-explanation-trigger';
import Pagination from '@/components/navigation/pagination';
import PageHead from '@/components/seo/page-head';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import type { CompetitionPageProps } from '@/types/competition';

const recentFormResults: Record<
    'W' | 'D' | 'L',
    { label: string; className: string }
> = {
    W: {
        label: 'Gewonnen',
        className: 'border-[#355642] bg-[#20352a] text-[#a6d7b7]',
    },
    D: {
        label: 'Gelijkgespeeld',
        className: 'border-[#3b423e] bg-[#252b28] text-[#c2c9c4]',
    },
    L: {
        label: 'Verloren',
        className: 'border-[#573a37] bg-[#352725] text-[#d7aaa4]',
    },
};

export default function CompetitionPage(props: CompetitionPageProps) {
    const {
        competition,
        tab,
        standings,
        fixtures,
        teams,
        teamStatistics,
        topScorers,
    } = props;
    const [showStandingsExplanation, setShowStandingsExplanation] =
        useState(false);
    const hasFixtures =
        fixtures.upcoming.length > 0 || fixtures.recent.length > 0;
    const hasStatistics = teamStatistics.length > 0 || topScorers.length > 0;
    const availableTabs = [
        'overview',
        ...(hasFixtures ? ['matches'] : []),
        ...(standings.length > 0 ? ['standings'] : []),
        ...(hasStatistics ? ['statistics'] : []),
        ...(teams.length > 0 ? ['teams'] : []),
    ] as CompetitionPageProps['tab'][];
    const activeTab = availableTabs.includes(tab) ? tab : 'overview';

    return (
        <>
            <PageHead
                title={competition.name}
                description={`${competition.name}${competition.country ? ` · ${competition.country}` : ''}${competition.season ? ` · Seizoen ${competition.season}` : ''}. Bekijk beschikbare wedstrijden, standen en statistieken.`}
            />
            <Link
                href={CompetitionsController.url()}
                className="mb-7 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#949d97] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
            >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Alle competities
            </Link>
            <header className="mb-8 flex flex-wrap items-center gap-4 border-b border-[#343b37] pb-7 sm:gap-5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#f3f4f1] p-2.5 sm:size-16">
                    <ImageWithFallback
                        src={competition.logoUrl ?? undefined}
                        alt=""
                        className="size-full object-contain"
                    />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                        Competitie
                    </p>
                    <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
                        {competition.name}
                    </h1>
                    <p className="mt-2 text-sm text-[#949d97]">
                        {[
                            competition.country,
                            competition.season
                                ? `Seizoen ${competition.season}`
                                : null,
                        ]
                            .filter(Boolean)
                            .join(' · ') || 'Competitie'}
                    </p>
                </div>
                <div className="flex w-full flex-wrap gap-x-6 gap-y-2 text-xs text-[#949d97] sm:w-auto sm:justify-end">
                    {competition.teamsCount && (
                        <span>
                            <strong className="font-semibold text-[#daddd9] tabular-nums">
                                {competition.teamsCount}
                            </strong>{' '}
                            teams
                        </span>
                    )}
                    {competition.currentRound && (
                        <span>
                            <strong className="font-semibold text-[#daddd9]">
                                {competition.currentRound}
                            </strong>
                        </span>
                    )}
                </div>
            </header>

            <CompetitionTabs
                competitionId={competition.id}
                activeTab={activeTab}
                availableTabs={availableTabs}
            />

            {activeTab === 'overview' && (
                <Overview
                    competitionId={competition.id}
                    fixtures={fixtures}
                    standings={standings}
                    teams={teams}
                />
            )}
            {activeTab === 'matches' && (
                <section aria-labelledby="all-matches-heading">
                    <SectionHeading
                        id="all-matches-heading"
                        title="Wedstrijden"
                    />
                    <CompetitionFixtureList
                        matches={fixtures.all.data}
                        emptyMessage="Er zijn nog geen wedstrijden beschikbaar voor dit seizoen."
                    />
                    <Pagination links={fixtures.all.links} />
                </section>
            )}
            {activeTab === 'standings' && (
                <section aria-labelledby="standings-heading">
                    <SectionHeading id="standings-heading" title="Stand" />
                    <div className="mb-4 flex justify-end">
                        <StandingsExplanationTrigger
                            onClick={() => setShowStandingsExplanation(true)}
                        />
                    </div>
                    <CompetitionStandings groups={standings} />
                </section>
            )}
            <StandingsExplanationModal
                open={showStandingsExplanation}
                onOpenChange={setShowStandingsExplanation}
            />
            {activeTab === 'statistics' && (
                <Statistics
                    teamStatistics={teamStatistics}
                    topScorers={topScorers}
                />
            )}
            {activeTab === 'teams' && (
                <section aria-labelledby="teams-heading">
                    <SectionHeading id="teams-heading" title="Teams" />
                    <CompetitionTeams teams={teams} />
                </section>
            )}
        </>
    );
}

function Overview({
    competitionId,
    fixtures,
    standings,
    teams,
}: Pick<CompetitionPageProps, 'fixtures' | 'standings' | 'teams'> & {
    competitionId: number;
}) {
    const upcoming = fixtures.upcoming;
    const recent = fixtures.recent;
    const aiFixtures = [...upcoming, ...recent].filter(
        (fixture) => fixture.hasAiPrediction,
    );
    const hasMatchContent = upcoming.length > 0 || recent.length > 0;

    if (
        upcoming.length === 0 &&
        recent.length === 0 &&
        standings.length === 0 &&
        teams.length === 0
    ) {
        return (
            <p className="border-y border-[#262c29] py-8 text-sm text-[#949d97]">
                Wedstrijdgegevens voor deze competitie zijn nog niet
                beschikbaar.
            </p>
        );
    }

    return (
        <div
            className={`grid gap-x-12 gap-y-12 ${hasMatchContent ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]' : ''}`}
        >
            <div
                className={`grid content-start gap-10 ${hasMatchContent ? '' : 'hidden'}`}
            >
                {upcoming.length > 0 && (
                    <section aria-labelledby="upcoming-heading">
                        <SectionHeading
                            id="upcoming-heading"
                            title="Eerstvolgende wedstrijden"
                            action={
                                <TabLink
                                    competitionId={competitionId}
                                    tab="matches"
                                    label="Alle wedstrijden"
                                />
                            }
                        />
                        <CompetitionFixtureList
                            matches={upcoming.slice(0, 4)}
                            emptyMessage=""
                        />
                    </section>
                )}
                {recent.length > 0 && (
                    <section aria-labelledby="recent-heading">
                        <SectionHeading
                            id="recent-heading"
                            title="Recente uitslagen"
                            action={
                                <TabLink
                                    competitionId={competitionId}
                                    tab="matches"
                                    label="Wedstrijdschema"
                                />
                            }
                        />
                        <CompetitionFixtureList
                            matches={recent.slice(0, 4)}
                            emptyMessage=""
                        />
                    </section>
                )}
                {aiFixtures.length > 0 && (
                    <section aria-labelledby="ai-heading">
                        <SectionHeading id="ai-heading" title="AI-analyses" />
                        <ul className="divide-y divide-[#262c29]">
                            {aiFixtures.slice(0, 3).map((fixture) => (
                                <li key={fixture.id}>
                                    <Link
                                        href={PredictionDetailsController[
                                            '/predictions/{fixture}/ai'
                                        ].url(fixture.id)}
                                        className="flex min-h-14 items-center justify-between gap-4 py-3 text-sm text-[#daddd9] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                                    >
                                        <span className="min-w-0 truncate">
                                            {fixture.homeTeam} –{' '}
                                            {fixture.awayTeam}
                                        </span>
                                        <span className="flex shrink-0 items-center gap-2 text-xs text-[#9ecbad]">
                                            Bekijk analyse
                                            <ArrowUpRight
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
            <div className="grid content-start gap-10">
                {standings.length > 0 && (
                    <section aria-labelledby="standings-preview-heading">
                        <SectionHeading
                            id="standings-preview-heading"
                            title="Stand"
                            action={
                                <TabLink
                                    competitionId={competitionId}
                                    tab="standings"
                                    label="Volledige stand"
                                />
                            }
                        />
                        <CompetitionStandings groups={standings} preview />
                    </section>
                )}
                {teams.length > 0 && (
                    <section aria-labelledby="teams-preview-heading">
                        <SectionHeading
                            id="teams-preview-heading"
                            title="Teams"
                            action={
                                <TabLink
                                    competitionId={competitionId}
                                    tab="teams"
                                    label="Alle teams"
                                />
                            }
                        />
                        <p className="border-b border-[#262c29] py-4 text-sm text-[#949d97]">
                            {teams.length} teams in deze competitie
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}

function Statistics({
    teamStatistics,
    topScorers,
}: Pick<CompetitionPageProps, 'teamStatistics' | 'topScorers'>) {
    return (
        <div className="grid gap-12 lg:grid-cols-2">
            {topScorers.length > 0 && (
                <section aria-labelledby="scorers-heading">
                    <SectionHeading id="scorers-heading" title="Topscorers" />
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[340px] text-sm">
                            <thead>
                                <tr className="border-b border-[#343b37] text-[10px] font-semibold tracking-wide text-[#7f8882] uppercase">
                                    <th className="py-3 text-left">Speler</th>
                                    <th className="w-14 py-3 text-right">G</th>
                                    <th className="w-14 py-3 text-right">A</th>
                                    <th className="w-14 py-3 text-right">W</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topScorers.map((scorer) => (
                                    <tr
                                        key={scorer.id}
                                        className="border-b border-[#262c29] last:border-0"
                                    >
                                        <td className="py-3 font-medium text-[#daddd9]">
                                            {scorer.name}
                                        </td>
                                        <td className="py-3 text-right font-bold text-white tabular-nums">
                                            {scorer.goals}
                                        </td>
                                        <td className="py-3 text-right text-[#949d97] tabular-nums">
                                            {scorer.assists}
                                        </td>
                                        <td className="py-3 text-right text-[#949d97] tabular-nums">
                                            {scorer.appearances}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="mt-3 text-[11px] text-[#737c76]">
                            Goals · assists · wedstrijden
                        </p>
                    </div>
                </section>
            )}
            {teamStatistics.length > 0 && (
                <section aria-labelledby="team-statistics-heading">
                    <SectionHeading
                        id="team-statistics-heading"
                        title="Teamstatistieken"
                    />
                    <ul className="divide-y divide-[#262c29]">
                        {teamStatistics.map((statistic, index) => (
                            <li
                                key={statistic.teamId ?? index}
                                className="flex min-h-14 items-center justify-between gap-4 py-3"
                            >
                                <span className="flex min-w-0 items-center gap-3">
                                    <span className="w-6 text-xs text-[#737c76] tabular-nums">
                                        {index + 1}
                                    </span>
                                    <ImageWithFallback
                                        src={statistic.teamLogoUrl ?? undefined}
                                        alt=""
                                        className="size-6 shrink-0 object-contain"
                                    />
                                    <span className="truncate text-sm font-medium text-[#daddd9]">
                                        {statistic.teamName ?? 'Team'}
                                    </span>
                                </span>
                                <span className="flex shrink-0 flex-col items-end text-right tabular-nums">
                                    <span className="text-xs leading-4 font-medium text-[#aeb6b0]">
                                        {statistic.wins} zeges ·{' '}
                                        {statistic.cleanSheets} clean sheets
                                    </span>
                                    {statistic.form && (
                                        <span
                                            role="group"
                                            aria-label="Recente resultaten"
                                            className="mt-1.5 flex min-h-6 items-center gap-1"
                                        >
                                            {[
                                                ...statistic.form.toUpperCase(),
                                            ].map((result, resultIndex) => {
                                                const resultDetails =
                                                    recentFormResults[
                                                        result as keyof typeof recentFormResults
                                                    ];

                                                if (!resultDetails) {
                                                    return null;
                                                }

                                                return (
                                                    <span
                                                        key={`${result}-${resultIndex}`}
                                                        role="img"
                                                        aria-label={
                                                            resultDetails.label
                                                        }
                                                        title={
                                                            resultDetails.label
                                                        }
                                                        className={`flex size-[22px] shrink-0 items-center justify-center rounded-[6px] border text-[10px] leading-none font-bold ${resultDetails.className}`}
                                                    >
                                                        {result}
                                                    </span>
                                                );
                                            })}
                                        </span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

function SectionHeading({
    id,
    title,
    action,
}: {
    id: string;
    title: string;
    action?: React.ReactNode;
}) {
    return (
        <header className="flex min-h-10 items-center justify-between gap-4 border-b border-[#343b37] pb-3">
            <h2
                id={id}
                className="text-xs font-semibold tracking-[0.13em] text-[#949d97] uppercase"
            >
                {title}
            </h2>
            {action}
        </header>
    );
}

function TabLink({
    competitionId,
    tab,
    label,
}: {
    competitionId: number;
    tab: 'matches' | 'standings' | 'teams';
    label: string;
}) {
    return (
        <Link
            href={CompetitionController.url(competitionId, { query: { tab } })}
            className="text-xs font-medium text-[#9ecbad] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
        >
            {label}
        </Link>
    );
}
