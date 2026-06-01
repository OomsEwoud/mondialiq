import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
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
    const predictionLabel =
        prediction?.outcome === 'draw'
            ? 'Predicted draw'
            : predictedWinner
              ? `Predicted winner: ${predictedWinner}`
              : null;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                <div className="min-w-0 rounded-xl bg-slate-50 p-2 sm:p-3">
                    <UserPredictionTeam
                        logo={match.homeTeamLogo}
                        name={match.homeTeam}
                        code={match.homeTeamShort}
                    />
                </div>

                <div className="min-w-[7.5rem] rounded-2xl border border-cyan-100 bg-cyan-50/50 px-3 py-4 text-center sm:min-w-40 sm:px-6">
                    <p className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Predicted score
                    </p>
                    <p className="mt-2 text-4xl leading-none font-black text-blue-950 sm:text-5xl">
                        {score ?? 'Not available'}
                    </p>
                    {predictionLabel ? (
                        <p className="mt-3 rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-black text-blue-950">
                            {predictionLabel}
                        </p>
                    ) : null}
                </div>

                <div className="min-w-0 rounded-xl bg-slate-50 p-2 sm:p-3">
                    <UserPredictionTeam
                        logo={match.awayTeamLogo}
                        name={match.awayTeam}
                        code={match.awayTeamShort}
                        align="right"
                    />
                </div>
            </div>
        </section>
    );
}
