import { Link } from '@inertiajs/react';
import PredictionPointsBadge from '@/components/predictions/prediction-points-badge';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';
import type { PredictionOwner } from '@/types/prediction';

interface Props {
    match: Match;
    score: string | null;
    owner: PredictionOwner;
}

export default function UserPredictedScoreCard({ match, score, owner }: Props) {
    const pointsAwarded = match.userPrediction?.pointsAwarded ?? false;
    const scoreLabel = owner.canEdit ? 'Your prediction' : 'Predicted score';

    return (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-center">
            <Link
                href={showTeam.url(match.homeTeamId)}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border transition-colors hover:bg-accent/30"
            >
                <ImageWithFallback
                    src={match.homeTeamLogo}
                    alt={match.homeTeam}
                    className="size-16 shrink-0 object-contain sm:size-20"
                />
                <span className="text-sm font-bold text-foreground group-hover:text-primary">
                    {match.homeTeamShort}
                </span>
            </Link>

            <div className="rounded-2xl border border-border bg-gradient-to-b from-accent/40 to-card px-6 py-6 text-center shadow-md sm:px-10 sm:py-8">
                <div className="flex justify-center">
                    <PredictionPointsBadge
                        points={match.userPrediction?.points ?? null}
                        pointsAwarded={pointsAwarded}
                        variant="indigo"
                    />
                </div>
                <p className="mt-4 text-5xl font-bold tracking-tight text-foreground tabular-nums sm:text-6xl">
                    {score ?? '—'}
                </p>
                <div className="mx-auto mt-4 h-px w-16 bg-indigo-200" />
                <p className="mt-4 text-xs font-semibold tracking-wide text-primary uppercase">
                    {scoreLabel}
                </p>
            </div>

            <Link
                href={showTeam.url(match.awayTeamId)}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border transition-colors hover:bg-accent/30"
            >
                <ImageWithFallback
                    src={match.awayTeamLogo}
                    alt={match.awayTeam}
                    className="size-16 shrink-0 object-contain sm:size-20"
                />
                <span className="text-sm font-bold text-foreground group-hover:text-primary">
                    {match.awayTeamShort}
                </span>
            </Link>
        </section>
    );
}
