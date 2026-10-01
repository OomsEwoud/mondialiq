import { Link } from '@inertiajs/react';
import { Calculator, CheckCircle2, Circle, Info } from 'lucide-react';
import PredictionPointsBadge from '@/components/predictions/prediction-points-badge';
import { cn } from '@/lib/utils';
import type {
    PredictionOwner,
    UserPredictionScoringPreview,
} from '@/types/prediction';
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
            <section className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <Calculator className="size-5" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                                {hasScoringPreview
                                    ? 'Scoring preview'
                                    : 'Scoring'}
                            </p>
                            <PredictionPointsBadge
                                points={awardedPoints}
                                pointsAwarded={pointsAwarded}
                            />
                        </div>
                        <h2 className="mt-1 text-xl font-bold text-foreground">
                            {pointsAwarded
                                ? `${awardedPoints}/20 official points`
                                : preview
                                  ? `Preview: ${preview.points}/${preview.maxPoints} pts`
                                  : 'Awaiting validation'}
                        </h2>
                    </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
                                        ? 'border-border bg-accent/50'
                                        : 'border-border bg-card',
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className={cn(
                                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                                            item.earned
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {item.earned ? (
                                            <CheckCircle2 className="size-3.5" />
                                        ) : (
                                            <Circle className="size-3" />
                                        )}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-white">
                                    +{item.points}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <Link
                    href={scoringGuideHref}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
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
        <section className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-white">
                    <Calculator className="size-5" />
                </span>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                            Points earned
                        </p>
                        <PredictionPointsBadge
                            points={officialPoints}
                            pointsAwarded={pointsAwarded}
                        />
                    </div>
                    <h2 className="mt-1 text-xl font-bold text-foreground">
                        {officialPoints}/20 official points
                    </h2>
                </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-950/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-200">
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
                                    ? 'border-border bg-accent/50'
                                    : 'border-border bg-card',
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={cn(
                                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                                        item.earned
                                            ? 'bg-cyan-500 text-white'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {item.earned ? (
                                        <CheckCircle2 className="size-3.5" />
                                    ) : (
                                        <Circle className="size-3" />
                                    )}
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-foreground">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-white">
                                +{item.points}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <Link
                href={scoringGuideHref}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                <Info className="size-4" />
                How scoring works
            </Link>
        </section>
    );
}
