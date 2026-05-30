import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    score: string | null;
}

export default function AiPredictionScoreCard({ match, score }: Props) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-[1fr] gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <UserPredictionTeam
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                    code={match.homeTeamShort}
                />

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-center">
                    <p className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Predicted score
                    </p>
                    <p className="mt-2 text-4xl font-black text-blue-950">
                        {score ?? 'Not available'}
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
