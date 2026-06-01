import { Link } from '@inertiajs/react';
import { Calculator, CheckCircle2, Circle, Info, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculatePredictionScore } from '@/utils/prediction-scoring';

interface Props {
    predictedHomeScore: number | null;
    predictedAwayScore: number | null;
    actualHomeScore: number | null;
    actualAwayScore: number | null;
    homeTeamName: string;
    awayTeamName: string;
    scoringGuideHref: string;
}

export default function PredictionScoreBreakdown({
    predictedHomeScore,
    predictedAwayScore,
    actualHomeScore,
    actualAwayScore,
    homeTeamName,
    awayTeamName,
    scoringGuideHref,
}: Props) {
    if (
        predictedHomeScore === null ||
        predictedAwayScore === null ||
        actualHomeScore === null ||
        actualAwayScore === null
    ) {
        return (
            <section className="rounded-2xl border border-cyan-100 bg-linear-to-br from-cyan-50/80 via-white to-blue-50/70 p-5 shadow-sm shadow-blue-950/5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 ring-1 ring-cyan-100">
                            <Trophy className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
                                Scoring preview
                            </p>
                            <h3 className="mt-2 text-xl font-black text-blue-950">
                                Points pending
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Your prediction can earn up to 20 points once
                                the match has a final score and both predicted
                                scores are filled in. Confidence is saved for
                                context, but does not affect points.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-cyan-200 bg-white px-5 py-4 text-center shadow-xs">
                        <div className="text-3xl font-black text-blue-950">
                            20
                        </div>
                        <div className="text-xs font-black tracking-wide text-cyan-700 uppercase">
                            max points
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                        <p className="text-xs font-black tracking-[0.16em] text-slate-400 uppercase">
                            Exact score
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                            Instantly earns the full 20 points.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                        <p className="text-xs font-black tracking-[0.16em] text-slate-400 uppercase">
                            Partial score
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                            Outcome, goal difference, team goals and total goals
                            can still score.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                        <p className="text-xs font-black tracking-[0.16em] text-slate-400 uppercase">
                            Confidence
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                            Stored only, no multiplier.
                        </p>
                    </div>
                </div>

                <Link
                    href={scoringGuideHref}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
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

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-blue-950/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                        <Calculator className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
                            Points earned
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-blue-950">
                            {score.total}/20 points
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Your prediction was{' '}
                            <span className="font-bold text-slate-900">
                                {homeTeamName} {predictedHomeScore}-
                                {predictedAwayScore} {awayTeamName}
                            </span>
                            . The final score was{' '}
                            <span className="font-bold text-slate-900">
                                {actualHomeScore}-{actualAwayScore}
                            </span>
                            .
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-4 text-center">
                    <div className="text-3xl font-black text-blue-950">
                        {score.total}
                    </div>
                    <div className="text-xs font-black tracking-wide text-cyan-700 uppercase">
                        points
                    </div>
                </div>
            </div>

            {score.exactScore ? (
                <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
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
                                'rounded-xl border p-4 transition-colors',
                                item.earned
                                    ? 'border-cyan-100 bg-cyan-50/70'
                                    : 'border-slate-200 bg-slate-50/70',
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                                            item.earned
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-slate-200 text-slate-400',
                                        )}
                                    >
                                        {item.earned ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : (
                                            <Circle className="size-3" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-blue-950">
                                            {item.label}
                                        </h4>
                                        <p className="mt-1 text-sm leading-5 text-slate-600">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        'shrink-0 rounded-full px-3 py-1 text-sm font-black',
                                        item.earned
                                            ? 'bg-blue-950 text-white'
                                            : 'bg-white text-slate-400 ring-1 ring-slate-200',
                                    )}
                                >
                                    +{item.points}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h4 className="text-sm font-black text-blue-950">
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
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <Info className="size-4" />
                    View guide
                </Link>
            </div>
        </section>
    );
}
