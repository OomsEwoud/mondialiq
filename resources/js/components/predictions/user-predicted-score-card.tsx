import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import { cn } from '@/lib/utils';
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
        ? `${match.userPrediction?.points ?? 0}/20 earned`
        : scoringPreview
          ? `Preview: ${scoringPreview.points}/${scoringPreview.maxPoints} pts`
          : 'Awaiting validation';

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-[1fr] gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <UserPredictionTeam
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                    code={match.homeTeamShort}
                />

                <div className="rounded-2xl border border-cyan-200 bg-gradient-to-b from-white to-cyan-50/40 px-5 py-5 text-center shadow-sm">
                    <div className="flex justify-center">
                        <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-bold tracking-wide text-cyan-600 uppercase shadow-sm">
                            {pointsLabel}
                        </span>
                    </div>
                    <p className="mt-3 text-xs font-bold tracking-wide text-slate-500 uppercase">
                        Predicted score
                    </p>
                    <p
                        className={cn(
                            'mt-2 font-bold text-slate-900 tabular-nums',
                            score ? 'text-4xl' : 'text-xl',
                        )}
                    >
                        {score ?? 'No score predicted'}
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
    );
}
