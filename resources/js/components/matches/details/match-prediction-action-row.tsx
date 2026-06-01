import { Link } from '@inertiajs/react';
import { PencilLine, Sparkles } from 'lucide-react';
import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import { Button } from '@/components/ui/forms/button';
import { show as showAiPrediction } from '@/routes/predictions/ai';
import type { Match } from '@/types/match';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

type MatchDetailsWithPredictionMeta = MatchDetails & {
    hasAiPrediction?: boolean;
};

export default function MatchPredictionActionRow({ match }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const hasAiPrediction = Boolean(
        (match as MatchDetailsWithPredictionMeta).hasAiPrediction,
    );
    const modalMatch = toPredictionMatch(match);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-blue-950/5 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-black tracking-widest text-cyan-600 uppercase">
                        Predictions
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                        Compare the model insight, then lock in your personal
                        pick.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {hasAiPrediction ? (
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 rounded-xl border-slate-200 bg-white px-4 font-black text-slate-700 shadow-none hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-cyan-300"
                        >
                            <Link href={showAiPrediction.url(match.id)}>
                                <Sparkles className="h-4 w-4 text-cyan-600" />
                                View AI prediction
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            disabled
                            variant="outline"
                            className="h-11 cursor-not-allowed rounded-xl border-slate-200 bg-slate-50 px-4 font-black text-slate-400 opacity-100 shadow-none"
                        >
                            <Sparkles className="h-4 w-4" />
                            AI pending
                        </Button>
                    )}

                    <Button
                        type="button"
                        onClick={() => setPredictionOpen(true)}
                        className="h-11 rounded-xl bg-blue-950 px-4 font-black text-white shadow-sm hover:bg-blue-900 focus-visible:ring-cyan-300"
                    >
                        <PencilLine className="h-4 w-4" />
                        Make prediction
                    </Button>
                </div>
            </div>

            <UserPredictionModal
                match={modalMatch}
                open={predictionOpen}
                onOpenChange={setPredictionOpen}
            />
        </section>
    );
}

function toPredictionMatch(match: MatchDetails): Match {
    return {
        id: match.id,
        homeTeamId: match.homeTeam.id,
        homeTeam: match.homeTeam.name,
        homeTeamShort: match.homeTeam.code,
        homeTeamLogo: match.homeTeam.logo,
        awayTeamId: match.awayTeam.id,
        awayTeam: match.awayTeam.name,
        awayTeamShort: match.awayTeam.code,
        awayTeamLogo: match.awayTeam.logo,
        round: match.round,
        date: match.date,
        dateValue: toDateValue(match.date),
        time: match.time,
        status: match.status,
        elapsedTime: match.elapsedTime,
        score: {
            fulltime: match.score.fulltime,
            extratime: match.score.extratime,
            penalties: match.score.penalties,
        },
        hasAiPrediction: (match as MatchDetailsWithPredictionMeta)
            .hasAiPrediction,
    };
}

function toDateValue(date: string): string {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    return parsedDate.toISOString().slice(0, 10);
}
