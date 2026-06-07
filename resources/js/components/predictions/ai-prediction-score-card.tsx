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
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                <div className="min-w-0 rounded-2xl bg-gradient-to-b from-white to-slate-50/60 p-3 shadow-sm">
                    <UserPredictionTeam
                        logo={match.homeTeamLogo}
                        name={match.homeTeam}
                        code={match.homeTeamShort}
                    />
                </div>

                <div className="min-w-[7.5rem] rounded-2xl border border-cyan-200 bg-gradient-to-b from-white to-cyan-50/40 px-3 py-5 text-center shadow-sm sm:min-w-40 sm:px-6">
                    <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                        Predicted score
                    </p>
                    <p className="mt-2 text-4xl leading-none font-bold text-slate-900 sm:text-5xl">
                        {score ?? 'Not available'}
                    </p>
                    {predictionLabel ? (
                        <p className="mt-4 inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
                            {predictionLabel}
                        </p>
                    ) : null}
                </div>

                <div className="min-w-0 rounded-2xl bg-gradient-to-b from-white to-slate-50/60 p-3 shadow-sm">
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
