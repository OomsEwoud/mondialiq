import { Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, PencilLine, Sparkles } from 'lucide-react';
import PredictionsController from '@/actions/App/Http/Controllers/Pages/PredictionsController';
import { Button } from '@/components/ui/forms/button';
import { show } from '@/routes/matches';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchPredictionActions({ match }: Props) {
    const userPredictionLabel = match.userPrediction
        ? 'Edit Prediction'
        : 'Make Prediction';

    return (
        <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Match actions
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        Review the matchup, compare the model, then lock in your
                        pick.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Button
                        asChild
                        variant="outline"
                        className="justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-blue-950"
                    >
                        <Link href={show.url(match.id)}>
                            <BarChart3 className="h-4 w-4" />
                            Match Details
                        </Link>
                    </Button>

                    {match.hasAiPrediction ? (
                        <Button
                            asChild
                            variant="outline"
                            className="justify-center border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:text-cyan-900"
                        >
                            <Link
                                href={PredictionsController.url({
                                    query: { mode: 'ai' },
                                })}
                            >
                                <Sparkles className="h-4 w-4" />
                                View AI Prediction
                            </Link>
                        </Button>
                    ) : (
                        <span
                            className="cursor-not-allowed"
                            title="AI prediction is not available yet"
                        >
                            <Button
                                disabled
                                variant="outline"
                                className="w-full justify-center border-slate-200 bg-slate-50 text-slate-400"
                            >
                                <Sparkles className="h-4 w-4" />
                                AI Pending
                            </Button>
                        </span>
                    )}

                    <Button
                        asChild
                        className="justify-center bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950"
                    >
                        <Link
                            href={PredictionsController.url({
                                query: { mode: 'mine' },
                            })}
                        >
                            <PencilLine className="h-4 w-4" />
                            {userPredictionLabel}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
