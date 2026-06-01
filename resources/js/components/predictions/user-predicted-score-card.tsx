import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import { cn } from '@/lib/utils';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    score: string | null;
}

export default function UserPredictedScoreCard({ match, score }: Props) {
    const hasFinalScore =
        match.score.fulltime.home !== null &&
        match.score.fulltime.away !== null;
    const pointsLabel = hasFinalScore
        ? `${match.userPrediction?.points ?? 0}/20 earned`
        : 'Up to 20 points';

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-5">
            <div className="grid grid-cols-[1fr] gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <UserPredictionTeam
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                    code={match.homeTeamShort}
                />

                <div className="rounded-2xl border border-cyan-100 bg-linear-to-b from-cyan-50/80 to-white px-5 py-4 text-center shadow-inner shadow-cyan-100/40">
                    <div className="flex justify-center">
                        <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-black tracking-[0.16em] text-cyan-700 uppercase">
                            {pointsLabel}
                        </span>
                    </div>
                    <p className="mt-3 text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase">
                        Predicted score
                    </p>
                    <p
                        className={cn(
                            'mt-2 font-black text-blue-950 tabular-nums',
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
