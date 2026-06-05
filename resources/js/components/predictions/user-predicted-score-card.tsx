import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import { cn } from '@/lib/utils';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    score: string | null;
}

export default function UserPredictedScoreCard({ match, score }: Props) {
    const pointsAwarded = match.userPrediction?.pointsAwarded ?? false;
    const pointsLabel = pointsAwarded
        ? `${match.userPrediction?.points ?? 0}/20 earned`
        : 'Points pending';

    return (
        <section className="rounded-[1.9rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-4 shadow-xl shadow-cyan-950/8 sm:p-6">
            <div className="grid grid-cols-[1fr] gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <UserPredictionTeam
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                    code={match.homeTeamShort}
                />

                <div className="rounded-[1.7rem] border border-cyan-200 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.18),transparent_10rem),linear-gradient(180deg,rgba(236,254,255,0.88),rgba(255,255,255,0.98))] px-5 py-5 text-center shadow-lg shadow-cyan-950/6">
                    <div className="flex justify-center">
                        <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-black tracking-[0.16em] text-cyan-700 uppercase shadow-sm shadow-cyan-950/5">
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
