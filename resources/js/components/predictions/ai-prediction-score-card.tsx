import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import PredictionPointsBadge from '@/components/predictions/prediction-points-badge';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { cn } from '@/lib/utils';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    score: string | null;
}

export default function AiPredictionScoreCard({ match, score }: Props) {
    const prediction = match.aiPrediction;
    const predictedWinner =
        prediction?.winnerId === match.homeTeamId
            ? match.homeTeam
            : prediction?.winnerId === match.awayTeamId
              ? match.awayTeam
              : null;
    const homeIsWinner = prediction?.winnerId === match.homeTeamId;
    const awayIsWinner = prediction?.winnerId === match.awayTeamId;
    const pointsAwarded = prediction?.pointsAwarded ?? false;

    return (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-center">
            <Link
                href={showTeam.url(match.homeTeamId)}
                className={cn(
                    'group flex flex-col items-center gap-3 rounded-2xl p-5 shadow-sm ring-1 transition-colors',
                    homeIsWinner
                        ? 'bg-gradient-to-b from-accent to-card ring-primary/50 hover:bg-accent'
                        : 'bg-card ring-border hover:bg-accent/30',
                )}
            >
                <ImageWithFallback
                    src={match.homeTeamLogo}
                    alt={match.homeTeam}
                    className="size-16 shrink-0 object-contain sm:size-20"
                />
                <span className="text-sm font-bold text-foreground group-hover:text-primary">
                    {match.homeTeamShort}
                </span>
                {homeIsWinner && (
                    <span className="rounded-full bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                        Pick
                    </span>
                )}
            </Link>

            <div className="rounded-2xl border border-border bg-gradient-to-b from-accent/60 to-card px-6 py-6 text-center shadow-md sm:px-10 sm:py-8">
                <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="size-3" />
                    AI prediction
                </p>
                <p className="mt-4 text-5xl font-bold tracking-tight text-foreground tabular-nums sm:text-6xl">
                    {score ?? 'N/A'}
                </p>
                <div className="mx-auto mt-4 h-px w-16 bg-border-strong" />
                <div className="mt-4 flex justify-center">
                    <PredictionPointsBadge
                        points={prediction?.points ?? null}
                        pointsAwarded={pointsAwarded}
                    />
                </div>
                {predictedWinner && prediction?.outcome !== 'draw' && (
                    <p className="mt-1 text-sm font-bold text-emerald-200">
                        {predictedWinner} to win
                    </p>
                )}
                {prediction?.outcome === 'draw' && (
                    <p className="mt-1 text-sm font-bold text-muted-foreground">
                        Draw predicted
                    </p>
                )}
            </div>

            <Link
                href={showTeam.url(match.awayTeamId)}
                className={cn(
                    'group flex flex-col items-center gap-3 rounded-2xl p-5 shadow-sm ring-1 transition-colors',
                    awayIsWinner
                        ? 'bg-gradient-to-b from-accent to-card ring-primary/50 hover:bg-accent'
                        : 'bg-card ring-border hover:bg-accent/30',
                )}
            >
                <ImageWithFallback
                    src={match.awayTeamLogo}
                    alt={match.awayTeam}
                    className="size-16 shrink-0 object-contain sm:size-20"
                />
                <span className="text-sm font-bold text-foreground group-hover:text-primary">
                    {match.awayTeamShort}
                </span>
                {awayIsWinner && (
                    <span className="rounded-full bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                        Pick
                    </span>
                )}
            </Link>
        </section>
    );
}
