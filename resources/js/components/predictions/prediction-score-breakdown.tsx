import { Link } from '@inertiajs/react';
import { Calculator, CheckCircle2, Circle, Info, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserPredictionScoringPreview } from '@/types/prediction';
import { calculatePredictionScore } from '@/utils/prediction-scoring';

interface Props {
    predictedHomeScore: number | null;
    predictedAwayScore: number | null;
    actualHomeScore: number | null;
    actualAwayScore: number | null;
    pointsAwarded: boolean;
    awardedPoints: number | null;
    scoringPreview: UserPredictionScoringPreview | null;
    homeTeamName: string;
    awayTeamName: string;
    scoringGuideHref: string;
}

export default function PredictionScoreBreakdown({
    predictedHomeScore,
    predictedAwayScore,
    actualHomeScore,
    actualAwayScore,
    pointsAwarded,
    awardedPoints,
    scoringPreview,
    homeTeamName,
    awayTeamName,
    scoringGuideHref,
}: Props) {
    const missingScoreContext =
        predictedHomeScore === null ||
        predictedAwayScore === null ||
        actualHomeScore === null ||
        actualAwayScore === null;
    const preview = pointsAwarded ? null : scoringPreview;
    const hasScoringPreview = preview !== null;
    const pendingTitle = preview
        ? `Preview: ${preview.points}/${preview.maxPoints} pts`
        : 'Awaiting validation';
    const pendingHelper = preview
        ? preview.helper
        : 'Your prediction can earn up to 20 possible points once the match has finished and scoring validation has run. Confidence is saved for context, but does not affect points.';

    if (!pointsAwarded || missingScoreContext) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-slate-200">
                            <Trophy className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                {hasScoringPreview
                                    ? 'Provisional scoring preview'
                                    : 'Scoring state'}
                            </p>
                            <h3 className="mt-2 text-xl font-bold text-slate-900">
                                {pointsAwarded
                                    ? `${awardedPoints ?? 0}/20 official points`
                                    : pendingTitle}
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                {pointsAwarded
                                    ? 'Your prediction has been validated, but there is not enough score detail to show a full breakdown.'
                                    : pendingHelper}
                            </p>
                        </div>
                    </div>

                    {pointsAwarded || hasScoringPreview ? (
                        <div className="rounded-2xl border border-cyan-200 bg-white px-5 py-4 text-center shadow-sm">
                            <div className="text-3xl font-semibold text-slate-900">
                                {pointsAwarded
                                    ? (awardedPoints ?? 0)
                                    : (preview?.points ?? 0)}
                            </div>
                            <div className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                {pointsAwarded
                                    ? 'official points'
                                    : 'preview points'}
                            </div>
                        </div>
                    ) : null}
                </div>

                {preview ? (
                    preview.breakdown.exactScore ? (
                        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                                <CheckCircle2 className="size-4" />
                                Perfect prediction preview
                            </div>
                            <p className="mt-1 text-sm text-emerald-700">
                                Based on the current score, this would earn the
                                full 20 possible points after validation.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                            {preview.breakdown.items.map((item) => (
                                <div
                                    key={item.label}
                                    className={cn(
                                        'rounded-2xl border p-4 shadow-sm transition-colors',
                                        item.earned
                                            ? 'border-slate-200 bg-cyan-50/70 shadow-sm'
                                            : 'border-slate-200 bg-slate-50/70 shadow-sm',
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={cn(
                                                    'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                                                    item.earned
                                                        ? 'bg-cyan-500 text-white'
                                                        : 'bg-slate-200 text-slate-600',
                                                )}
                                            >
                                                {item.earned ? (
                                                    <CheckCircle2 className="size-4" />
                                                ) : (
                                                    <Circle className="size-3" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-900">
                                                    {item.label}
                                                </h4>
                                                <p className="mt-1 text-sm leading-5 text-slate-600">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                'shrink-0 rounded-full px-3 py-1 text-sm font-semibold',
                                                item.earned
                                                    ? 'bg-blue-950 text-white'
                                                    : 'bg-white text-slate-600 ring-1 ring-slate-200',
                                            )}
                                        >
                                            +{item.points}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                Exact score
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                                Can earn the full 20 possible points.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                Partial score
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                                Outcome, goal difference, team goals and total
                                goals can still score.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                Confidence
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                                Stored only, no multiplier.
                            </p>
                        </div>
                    </div>
                )}

                <Link
                    href={scoringGuideHref}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                >
                    <Info className="size-4" />
                    How scoring works
                </Link>
            </section>
        );
    }

    const score = calculatePredictionScore({
        predictedHomeScore,
        predictedAwayScore,
        actualHomeScore,
        actualAwayScore,
    });
    const officialPoints = awardedPoints ?? score.total;

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-slate-600 ring-1 ring-slate-200">
                        <Calculator className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                            Points earned
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">
                            {officialPoints}/20 official points
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Your prediction was{' '}
                            <span className="font-semibold text-slate-900">
                                {homeTeamName} {predictedHomeScore}-
                                {predictedAwayScore} {awayTeamName}
                            </span>
                            . The final score was{' '}
                            <span className="font-semibold text-slate-900">
                                {actualHomeScore}-{actualAwayScore}
                            </span>
                            .
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-center shadow-sm">
                    <div className="text-3xl font-semibold text-slate-900">
                        {officialPoints}
                    </div>
                    <div className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                        official points
                    </div>
                </div>
            </div>

            {score.exactScore ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                        <CheckCircle2 className="size-4" />
                        Perfect prediction
                    </div>
                    <p className="mt-1 text-sm text-emerald-700">
                        You predicted the exact score and earned the maximum 20
                        points.
                    </p>
                </div>
            ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {score.items.map((item) => (
                        <div
                            key={item.label}
                            className={cn(
                                'rounded-2xl border p-4 shadow-sm transition-colors',
                                item.earned
                                    ? 'border-slate-200 bg-cyan-50/70 shadow-sm'
                                    : 'border-slate-200 bg-slate-50/70 shadow-sm',
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                                            item.earned
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-slate-200 text-slate-600',
                                        )}
                                    >
                                        {item.earned ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : (
                                            <Circle className="size-3" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900">
                                            {item.label}
                                        </h4>
                                        <p className="mt-1 text-sm leading-5 text-slate-600">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        'shrink-0 rounded-full px-3 py-1 text-sm font-semibold',
                                        item.earned
                                            ? 'bg-blue-950 text-white'
                                            : 'bg-white text-slate-600 ring-1 ring-slate-200',
                                    )}
                                >
                                    +{item.points}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                        How points are calculated
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Exact score gives 20 points. Otherwise you can score on
                        outcome, goal difference, team goals and total goals.
                        Confidence does not affect points.
                    </p>
                </div>
                <Link
                    href={scoringGuideHref}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <Info className="size-4" />
                    View guide
                </Link>
            </div>
        </section>
    );
}
