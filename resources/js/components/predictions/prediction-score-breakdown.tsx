import { Link } from '@inertiajs/react';
import { Calculator, CheckCircle2, Circle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PredictionOwner, UserPredictionScoringPreview } from '@/types/prediction';
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
    owner: PredictionOwner;
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
    owner,
}: Props) {
    const missingScoreContext =
        predictedHomeScore === null ||
        predictedAwayScore === null ||
        actualHomeScore === null ||
        actualAwayScore === null;
    const preview = pointsAwarded ? null : scoringPreview;
    const hasScoringPreview = preview !== null;
    const isOwn = owner.canEdit;
    const predictionPronoun = isOwn ? 'Your' : 'This';

    if (!pointsAwarded || missingScoreContext) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <Calculator className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            {hasScoringPreview ? 'Scoring preview' : 'Scoring'}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            {pointsAwarded
                                ? `${awardedPoints}/20 official points`
                                : preview
                                  ? `Preview: ${preview.points}/${preview.maxPoints} pts`
                                  : 'Awaiting validation'}
                        </h2>
                    </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                    {preview
                        ? preview.helper
                        : pointsAwarded
                          ? `${predictionPronoun} prediction has been validated but score details are incomplete.`
                          : `${predictionPronoun} prediction can earn up to 20 points once the match finishes and scoring validation runs.`}
                </p>

                {preview && (
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {preview.breakdown.items.map((item) => (
                            <div
                                key={item.label}
                                className={cn(
                                    'flex items-start justify-between gap-3 rounded-xl border p-4',
                                    item.earned
                                        ? 'border-cyan-200 bg-cyan-50/50'
                                        : 'border-slate-200 bg-white',
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className={cn(
                                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                                            item.earned
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-slate-100 text-slate-400',
                                        )}
                                    >
                                        {item.earned ? (
                                            <CheckCircle2 className="size-3.5" />
                                        ) : (
                                            <Circle className="size-3" />
                                        )}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <span className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                                    +{item.points}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <Link
                    href={scoringGuideHref}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
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
    const perfectLabel = isOwn ? 'You predicted' : `${owner.name} predicted`;

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Calculator className="size-5" />
                </span>
                <div>
                    <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                        Points earned
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                        {officialPoints}/20 official points
                    </h2>
                </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
                {predictionPronoun} prediction was{' '}
                <strong>
                    {homeTeamName} {predictedHomeScore}-{predictedAwayScore}{' '}
                    {awayTeamName}
                </strong>
                . The final score was{' '}
                <strong>
                    {actualHomeScore}-{actualAwayScore}
                </strong>
                .
            </p>

            {score.exactScore ? (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                        <CheckCircle2 className="size-4" />
                        Perfect prediction
                    </div>
                    <p className="mt-1 text-sm text-emerald-600">
                        {perfectLabel} the exact score and earned the maximum 20
                        points.
                    </p>
                </div>
            ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {score.items.map((item) => (
                        <div
                            key={item.label}
                            className={cn(
                                'flex items-start justify-between gap-3 rounded-xl border p-4',
                                item.earned
                                    ? 'border-cyan-200 bg-cyan-50/50'
                                    : 'border-slate-200 bg-white',
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={cn(
                                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                                        item.earned
                                            ? 'bg-cyan-500 text-white'
                                            : 'bg-slate-100 text-slate-400',
                                    )}
                                >
                                    {item.earned ? (
                                        <CheckCircle2 className="size-3.5" />
                                    ) : (
                                        <Circle className="size-3" />
                                    )}
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                                +{item.points}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <Link
                href={scoringGuideHref}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                <Info className="size-4" />
                How scoring works
            </Link>
        </section>
    );
}
