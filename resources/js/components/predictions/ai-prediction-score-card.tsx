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
        <section className="rounded-[1.9rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-4 shadow-xl shadow-cyan-950/8 sm:p-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                <div className="min-w-0 rounded-2xl bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] p-3 shadow-sm shadow-cyan-950/5">
                    <UserPredictionTeam
                        logo={match.homeTeamLogo}
                        name={match.homeTeam}
                        code={match.homeTeamShort}
                    />
                </div>

                <div className="min-w-[7.5rem] rounded-[1.6rem] border border-cyan-200 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.18),transparent_10rem),linear-gradient(180deg,rgba(236,254,255,0.9),rgba(255,255,255,0.98))] px-3 py-5 text-center shadow-lg shadow-cyan-950/6 sm:min-w-40 sm:px-6">
                    <p className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Predicted score
                    </p>
                    <p className="mt-2 text-4xl leading-none font-black text-blue-950 sm:text-5xl">
                        {score ?? 'Not available'}
                    </p>
                    {predictionLabel ? (
                        <p className="mt-4 inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-black text-blue-950 shadow-sm shadow-cyan-950/5">
                            {predictionLabel}
                        </p>
                    ) : null}
                </div>

                <div className="min-w-0 rounded-2xl bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] p-3 shadow-sm shadow-cyan-950/5">
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
