import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
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

    return (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-center">
            <Link
                href={showTeam.url(match.homeTeamId)}
                className={cn(
                    'group flex flex-col items-center gap-3 rounded-2xl p-5 shadow-sm ring-1 transition-colors',
                    homeIsWinner
                        ? 'bg-gradient-to-b from-emerald-50/60 to-white ring-emerald-200 hover:bg-emerald-50/80'
                        : 'bg-white ring-slate-200 hover:bg-cyan-50/30',
                )}
            >
                <img
                    src={match.homeTeamLogo}
                    alt={match.homeTeam}
                    className="size-16 shrink-0 object-contain sm:size-20"
                />
                <span className="text-sm font-bold text-slate-900 group-hover:text-cyan-700">
                    {match.homeTeamShort}
                </span>
                {homeIsWinner && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        Pick
                    </span>
                )}
            </Link>

            <div className="rounded-2xl border border-cyan-200 bg-gradient-to-b from-cyan-50/60 to-white px-6 py-6 text-center shadow-md sm:px-10 sm:py-8">
                <p className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
                    <Sparkles className="size-3" />
                    AI prediction
                </p>
                <p className="mt-4 text-5xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-6xl">
                    {score ?? 'N/A'}
                </p>
                <div className="mx-auto mt-4 h-px w-16 bg-cyan-200" />
                {predictedWinner && prediction?.outcome !== 'draw' && (
                    <p className="mt-4 text-sm font-bold text-emerald-700">
                        {predictedWinner} to win
                    </p>
                )}
                {prediction?.outcome === 'draw' && (
                    <p className="mt-4 text-sm font-bold text-slate-500">
                        Draw predicted
                    </p>
                )}
            </div>

            <Link
                href={showTeam.url(match.awayTeamId)}
                className={cn(
                    'group flex flex-col items-center gap-3 rounded-2xl p-5 shadow-sm ring-1 transition-colors',
                    awayIsWinner
                        ? 'bg-gradient-to-b from-emerald-50/60 to-white ring-emerald-200 hover:bg-emerald-50/80'
                        : 'bg-white ring-slate-200 hover:bg-cyan-50/30',
                )}
            >
                <img
                    src={match.awayTeamLogo}
                    alt={match.awayTeam}
                    className="size-16 shrink-0 object-contain sm:size-20"
                />
                <span className="text-sm font-bold text-slate-900 group-hover:text-cyan-700">
                    {match.awayTeamShort}
                </span>
                {awayIsWinner && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        Pick
                    </span>
                )}
            </Link>
        </section>
    );
}
