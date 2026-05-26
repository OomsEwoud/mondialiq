import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Gauge,
    Goal,
    LineChart,
    PencilLine,
    Sparkles,
    Trophy,
} from 'lucide-react';
import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';
import { show as showMatch } from '@/routes/matches';
import type { Match } from '@/types/match';
import type {
    AiPredictionContext,
    ApiPredictionSummary,
    MarketOddsSummary,
} from '@/types/prediction';

interface Props {
    match: Match;
    aiContext: AiPredictionContext;
}

export default function AiPredictionReport({ match, aiContext }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const prediction = match.aiPrediction;
    const score = aiPredictionScoreLabel(match);
    const confidence = formatConfidence(prediction?.confidence);

    return (
        <>
            <div className="space-y-4 sm:space-y-5">
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-linear-to-r from-cyan-50 via-white to-blue-50 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-black tracking-[0.28em] text-cyan-600 uppercase">
                                    AI Prediction Report
                                </p>
                                <h1 className="mt-2 text-2xl leading-tight font-black text-blue-950 sm:text-3xl">
                                    {match.homeTeam} vs {match.awayTeam}
                                </h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    {match.round} &middot; {match.date} &middot;{' '}
                                    {match.time}
                                </p>
                            </div>

                            <div className="flex w-fit items-center gap-2 rounded-md border border-blue-100 bg-white px-3 py-2 text-xs font-black tracking-[0.18em] text-blue-950 uppercase shadow-xs">
                                <Sparkles className="size-4 text-cyan-500" />
                                {match.status || match.round}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="grid grid-cols-[1fr] gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                        <UserPredictionTeam
                            logo={match.homeTeamLogo}
                            name={match.homeTeam}
                            code={match.homeTeamShort}
                        />

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-center">
                            <p className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">
                                Predicted score
                            </p>
                            <p className="mt-2 text-4xl font-black text-blue-950">
                                {score ?? 'Not available'}
                            </p>
                        </div>

                        <UserPredictionTeam
                            logo={match.awayTeamLogo}
                            name={match.awayTeam}
                            code={match.awayTeamShort}
                            align="right"
                        />
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-3">
                    <SummaryCard
                        icon={Trophy}
                        label="Predicted outcome"
                        value={prediction?.label ?? 'Outcome not available'}
                    />
                    <SummaryCard
                        icon={Gauge}
                        label="Confidence"
                        value={confidence.value}
                        helper={confidence.label}
                    />
                    <SummaryCard
                        icon={Goal}
                        label="Expected score"
                        value={score ?? 'Score prediction not available'}
                    />
                </section>

                <ProbabilityBreakdown match={match} />

                <PredictionSourceComparison aiContext={aiContext} />

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-md bg-blue-100 text-blue-900">
                            <Sparkles className="size-4" />
                        </span>
                        <div>
                            <h2 className="text-base font-black text-blue-950">
                                Why this prediction?
                            </h2>
                            <p className="text-xs font-medium text-slate-500">
                                Model reasoning based on the available match
                                context.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 max-w-3xl rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm leading-7 font-medium text-slate-700">
                            {cleanAdvice(prediction?.advice) ??
                                'No AI explanation available yet'}
                        </p>
                    </div>
                </section>

                <section className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                        asChild
                        variant="outline"
                        className="justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-blue-950"
                    >
                        <Link href={showMatch.url(match.id)}>
                            <LineChart className="size-4" />
                            View match details
                        </Link>
                    </Button>

                    <Button
                        type="button"
                        className="justify-center bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950"
                        onClick={() => setPredictionOpen(true)}
                    >
                        <PencilLine className="size-4" />
                        {match.userPrediction
                            ? 'Edit your prediction'
                            : 'Make your prediction'}
                    </Button>
                </section>
            </div>

            <UserPredictionModal
                match={match}
                open={predictionOpen}
                onOpenChange={setPredictionOpen}
            />
        </>
    );
}

interface SummaryCardProps {
    icon: typeof Trophy;
    label: string;
    value: string;
    helper?: string;
}

function SummaryCard({ icon: Icon, label, value, helper }: SummaryCardProps) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-100 text-cyan-700">
                    <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                        {label}
                    </p>
                    <p className="mt-1 text-lg leading-tight font-black text-blue-950">
                        {value}
                    </p>
                    {helper && (
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                            {helper}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

function ProbabilityBreakdown({ match }: { match: Match }) {
    const probabilities = match.prediction
        ? [
              {
                  label: `${match.homeTeamShort} win`,
                  value: match.prediction.homeWin,
                  tone: 'home' as const,
              },
              {
                  label: 'Draw',
                  value: match.prediction.draw,
                  tone: 'draw' as const,
              },
              {
                  label: `${match.awayTeamShort} win`,
                  value: match.prediction.awayWin,
                  tone: 'away' as const,
              },
          ]
        : [];

    if (probabilities.length === 0) {
        return null;
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-black text-blue-950">
                        Probability breakdown
                    </h2>
                    <p className="text-xs font-medium text-slate-500">
                        Estimated outcome chances, not certainties.
                    </p>
                </div>
                <BarChart3 className="size-5 text-cyan-500" />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
                {probabilities.map((probability) => (
                    <ProbabilityCard
                        key={probability.label}
                        label={probability.label}
                        value={probability.value}
                        tone={probability.tone}
                    />
                ))}
            </div>
        </section>
    );
}

function ProbabilityCard({
    label,
    value,
    tone,
}: {
    label: string;
    value: number | null;
    tone: 'home' | 'draw' | 'away';
}) {
    const percentage = formatProbability(value);
    const width = value === null ? 0 : Math.max(0, Math.min(100, value));

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-blue-950">{label}</p>
                <p className="text-sm font-black text-blue-950">{percentage}</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div
                    className={cn(
                        'h-2 rounded-full',
                        tone === 'home' && 'bg-blue-950',
                        tone === 'draw' && 'bg-cyan-500',
                        tone === 'away' && 'bg-slate-500',
                    )}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}

function PredictionSourceComparison({
    aiContext,
}: {
    aiContext: AiPredictionContext;
}) {
    const hasMarket = hasMarketOdds(aiContext.marketOdds);
    const hasApi = aiContext.apiPrediction !== null;

    if (!hasMarket && !hasApi) {
        return null;
    }

    return (
        <section className="grid gap-4 lg:grid-cols-2">
            {hasMarket && (
                <MarketSourceCard marketOdds={aiContext.marketOdds} />
            )}
            {aiContext.apiPrediction && (
                <ApiSourceCard apiPrediction={aiContext.apiPrediction} />
            )}
        </section>
    );
}

function MarketSourceCard({ marketOdds }: { marketOdds: MarketOddsSummary }) {
    return (
        <SourceCard
            title="Market view"
            subtitle="Averaged bookmaker signal"
            rows={[
                [
                    'Home win',
                    formatProbability(marketOdds.home_win_probability),
                ],
                ['Draw', formatProbability(marketOdds.draw_probability)],
                [
                    'Away win',
                    formatProbability(marketOdds.away_win_probability),
                ],
                [
                    'Over 2.5',
                    formatProbability(marketOdds.over_2_5_probability),
                ],
                [
                    'Most likely score',
                    normalizeScore(marketOdds.most_likely_score) ??
                        'Not available',
                ],
            ]}
        />
    );
}

function ApiSourceCard({
    apiPrediction,
}: {
    apiPrediction: ApiPredictionSummary;
}) {
    return (
        <SourceCard
            title="API view"
            subtitle="API-Football prediction signal"
            rows={[
                [
                    'Advice',
                    apiPrediction.api_predicted_outcome ??
                        apiPrediction.api_advice ??
                        'Not available',
                ],
                [
                    'Home chance',
                    formatProbability(apiPrediction.api_home_chance),
                ],
                [
                    'Draw chance',
                    formatProbability(apiPrediction.api_draw_chance),
                ],
                [
                    'Away chance',
                    formatProbability(apiPrediction.api_away_chance),
                ],
                ['Goal trend', apiPrediction.api_goal_trend ?? 'Not available'],
            ]}
        />
    );
}

function SourceCard({
    title,
    subtitle,
    rows,
}: {
    title: string;
    subtitle: string;
    rows: Array<[string, string]>;
}) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
                <h2 className="text-base font-black text-blue-950">{title}</h2>
                <p className="text-xs font-medium text-slate-500">{subtitle}</p>
            </div>
            <dl className="mt-4 space-y-3">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
                    >
                        <dt className="text-sm font-medium text-slate-500">
                            {label}
                        </dt>
                        <dd className="text-right text-sm font-black text-blue-950">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </article>
    );
}

function aiPredictionScoreLabel(match: Match): string | null {
    if (
        match.aiPrediction?.homeScore === null ||
        match.aiPrediction?.homeScore === undefined ||
        match.aiPrediction.awayScore === null ||
        match.aiPrediction.awayScore === undefined
    ) {
        return null;
    }

    return `${match.aiPrediction.homeScore} - ${match.aiPrediction.awayScore}`;
}

function formatConfidence(confidence: string | null | undefined): {
    value: string;
    label: string;
} {
    if (!confidence) {
        return {
            value: 'Not available',
            label: 'Confidence not available',
        };
    }

    const numericConfidence = Number(confidence);

    if (Number.isNaN(numericConfidence)) {
        return {
            value: confidence,
            label: 'Model confidence',
        };
    }

    return {
        value: `${Math.round(numericConfidence)} / 100`,
        label: confidenceLabel(numericConfidence),
    };
}

function confidenceLabel(confidence: number): string {
    if (confidence >= 75) {
        return 'High confidence';
    }

    if (confidence >= 50) {
        return 'Moderate confidence';
    }

    return 'Low confidence';
}

function formatProbability(value: number | null): string {
    if (value === null) {
        return 'Not available';
    }

    return `${Math.round(value)}%`;
}

function normalizeScore(score: string | null): string | null {
    return score?.replace(':', ' - ') ?? null;
}

function cleanAdvice(advice: string | null | undefined): string | null {
    return advice?.replace(/^AI outcome:\s*[^.]+\.\s*/i, '').trim() || null;
}

function hasMarketOdds(marketOdds: MarketOddsSummary): boolean {
    return [
        marketOdds.home_win_probability,
        marketOdds.draw_probability,
        marketOdds.away_win_probability,
        marketOdds.over_2_5_probability,
        marketOdds.most_likely_score,
    ].some((value) => value !== null);
}
