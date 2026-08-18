import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import EmptyState from '@/components/dashboard/empty-state';
import FeaturedMatch from '@/components/dashboard/featured-match';
import LivePanel from '@/components/dashboard/live-panel';
import MatchList from '@/components/dashboard/match-list';
import RecentResults from '@/components/dashboard/recent-results';
import PageHead from '@/components/seo/page-head';
import { matches, predictions } from '@/routes';
import type { DashboardProps } from '@/types/dashboard';

export default function Dashboard({
    upcomingFixtures,
    liveFixtures,
    recentFixtures,
    competitions,
}: DashboardProps) {
    const { auth } = usePage().props;
    const firstName = auth.user?.name.split(' ')[0] ?? 'voetbalfan';
    const featured =
        upcomingFixtures.find((match) => match.hasAiPrediction) ??
        upcomingFixtures[0];
    const remaining = featured
        ? upcomingFixtures
              .filter((match) => match.id !== featured.id)
              .slice(0, 4)
        : [];
    const analyses = upcomingFixtures
        .filter((match) => match.aiPrediction)
        .slice(0, 3);

    return (
        <>
            <PageHead
                title="Jouw voetbaloverzicht"
                description="Bekijk relevante wedstrijden, live scores en recente AI-analyses op MondialiQ."
            />
            <div className="space-y-12 sm:space-y-14">
                <header className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[#6fae88]">
                            {greeting()}, {firstName}
                        </p>
                        <h1 className="mt-1.5 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                            Dit speelt er vandaag.
                        </h1>
                        {upcomingFixtures.length > 0 ? (
                            <p className="mt-3 text-sm text-[#7f8882]">
                                {upcomingFixtures.length} wedstrijden ·{' '}
                                {
                                    upcomingFixtures.filter(
                                        (match) => match.hasAiPrediction,
                                    ).length
                                }{' '}
                                AI-analyses beschikbaar
                            </p>
                        ) : (
                            <p className="mt-3 text-sm text-[#7f8882]">
                                Zodra er nieuwe wedstrijden beschikbaar zijn,
                                verschijnen ze hier automatisch.
                            </p>
                        )}
                    </div>
                    <span className="text-sm font-medium text-[#68706b]">
                        {new Intl.DateTimeFormat('nl-BE', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        }).format(new Date())}
                    </span>
                </header>

                {featured ? (
                    <FeaturedMatch match={featured} />
                ) : (
                    <section>
                        <h2 className="text-xl font-bold text-white">
                            Voor jou
                        </h2>
                        <div className="mt-5">
                            <EmptyState
                                title="Nog geen wedstrijd in de kijker"
                                description="Er staan momenteel geen komende wedstrijden klaar. Zodra het programma is bijgewerkt, tonen we hier de eerstvolgende match met beschikbare AI-inzichten."
                                action={{
                                    label: 'Bekijk alle wedstrijden',
                                    href: matches(),
                                }}
                            />
                        </div>
                    </section>
                )}

                <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
                    <section className="order-2 lg:order-1">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                                    Binnenkort
                                </p>
                                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
                                    Komende wedstrijden
                                </h2>
                            </div>
                            <Link
                                href={matches()}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#949d97] hover:text-white"
                            >
                                Alles bekijken
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                        {remaining.length > 0 ? (
                            <div className="mt-6">
                                <MatchList matches={remaining} />
                            </div>
                        ) : (
                            <div className="mt-6">
                                <EmptyState
                                    title="Geen extra wedstrijden gepland"
                                    description="Naast de wedstrijd in de kijker zijn er momenteel geen andere komende wedstrijden beschikbaar."
                                    action={{
                                        label: 'Open het wedstrijdprogramma',
                                        href: matches(),
                                    }}
                                />
                            </div>
                        )}
                    </section>
                    <LivePanel
                        matches={liveFixtures}
                        className="order-1 lg:order-2"
                    />
                </div>

                <section>
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                                Net bijgewerkt
                            </p>
                            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
                                Nieuwe analyses
                            </h2>
                        </div>
                        <Link
                            href={predictions()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#949d97] hover:text-white"
                        >
                            Alle predictions
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                    {analyses.length > 0 ? (
                        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-[#262c29] bg-[#262c29] md:grid-cols-3">
                            {analyses.map((match) => (
                                <Link
                                    key={match.id}
                                    href={predictions({
                                        query: { date: match.dateValue },
                                    })}
                                    className="bg-[#111513] p-5 transition hover:bg-[#141916]"
                                >
                                    <span className="text-[0.65rem] font-semibold tracking-[0.08em] text-[#68706b] uppercase">
                                        {match.leagueName ?? match.round}
                                    </span>
                                    <strong className="mt-3 block text-sm font-bold text-[#e3e5e1]">
                                        {match.homeTeam} — {match.awayTeam}
                                    </strong>
                                    <p className="mt-3 text-base font-bold text-white">
                                        {analysisTitle(match)}
                                    </p>
                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#7f8882]">
                                        {analysisFallback(match)}
                                    </p>
                                    <span className="mt-4 block text-xs font-semibold text-[#9ecbad]">
                                        Bekijk analyse →
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6">
                            <EmptyState
                                title="Nog geen nieuwe analyses"
                                description="Er zijn momenteel geen AI-analyses voor komende wedstrijden. Nieuwe voorspellingen verschijnen hier zodra het model ze heeft verwerkt."
                                action={{
                                    label: 'Bekijk alle predictions',
                                    href: predictions(),
                                }}
                            />
                        </div>
                    )}
                </section>
                <RecentResults matches={recentFixtures} />
                <section>
                    <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                        In je overzicht
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
                        Competities in beeld
                    </h2>
                    {competitions.length > 0 ? (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {competitions.map((competition) => (
                                <span
                                    key={competition.id}
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#303732] bg-[#111513] px-3 py-2 text-sm font-semibold text-[#aeb5b0]"
                                >
                                    {competition.logoUrl && (
                                        <img
                                            src={competition.logoUrl}
                                            alt=""
                                            className="size-5 object-contain"
                                        />
                                    )}
                                    {competition.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6">
                            <EmptyState
                                title="Nog geen competities beschikbaar"
                                description="Zodra competities en hun wedstrijdprogramma zijn toegevoegd, vind je ze hier terug."
                            />
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

function greeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Goedemorgen';
    }

    if (hour < 18) {
        return 'Goedemiddag';
    }

    return 'Goedenavond';
}

function analysisTitle(match: DashboardProps['upcomingFixtures'][number]) {
    const prediction = match.aiPrediction;

    if (prediction?.outcome === 'home') {
        return `${match.homeTeam} krijgt het voordeel`;
    }

    if (prediction?.outcome === 'away') {
        return `${match.awayTeam} heeft de beste papieren`;
    }

    return 'Weinig verschil tussen beide teams';
}

function analysisFallback(match: DashboardProps['upcomingFixtures'][number]) {
    const chance = match.prediction;

    if (!chance) {
        return 'Bekijk de volledige AI-analyse voor deze wedstrijd.';
    }

    const highest = Math.max(chance.homeWin, chance.draw, chance.awayWin);

    if (highest === chance.homeWin) {
        return `${Math.round(chance.homeWin)}% kans op winst voor ${match.homeTeam}.`;
    }

    if (highest === chance.awayWin) {
        return `${Math.round(chance.awayWin)}% kans op winst voor ${match.awayTeam}.`;
    }

    return `${Math.round(chance.draw)}% kans op een gelijkspel.`;
}
