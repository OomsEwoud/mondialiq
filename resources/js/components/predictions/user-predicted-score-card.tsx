import { Link } from '@inertiajs/react';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';
import type { UserPredictionScoringPreview } from '@/types/prediction';

interface Props {
    match: Match;
    score: string | null;
    scoringPreview: UserPredictionScoringPreview | null;
}

export default function UserPredictedScoreCard({
    match,
    score,
    scoringPreview,
}: Props) {
    const pointsAwarded = match.userPrediction?.pointsAwarded ?? false;
    const pointsLabel = pointsAwarded
        ? `${match.userPrediction?.points ?? 0}/20 pts`
        : scoringPreview
          ? `Preview: ${scoringPreview.points}/${scoringPreview.maxPoints}`
          : 'Awaiting validation';

    return (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-center">
            <Link
                href={showTeam.url(match.homeTeamId)}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-indigo-50/30"
            >
                <img
                    src={match.homeTeamLogo}
                    alt={match.homeTeam}
                    className="size-16 shrink-0 object-contain sm:size-20"
                />
                <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                    {match.homeTeamShort}
                </span>
            </Link>

            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-white px-6 py-6 text-center shadow-md sm:px-10 sm:py-8">
                <p className="inline-flex rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
                    {pointsLabel}
                </p>
                <p className="mt-4 text-5xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-6xl">
                    {score ?? '—'}
                </p>
                <div className="mx-auto mt-4 h-px w-16 bg-indigo-200" />
                <p className="mt-4 text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                    Your prediction
                </p>
            </div>

            <Link
                href={showTeam.url(match.awayTeamId)}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-indigo-50/30"
            >
                <img
                    src={match.awayTeamLogo}
                    alt={match.awayTeam}
                    className="size-16 shrink-0 object-contain sm:size-20"
                />
                <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                    {match.awayTeamShort}
                </span>
            </Link>
        </section>
    );
}
