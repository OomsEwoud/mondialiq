import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show as showAiPrediction } from '@/routes/predictions/ai';

interface Props {
    matchId: number;
}

export default function UserPredictionAiComparisonCard({ matchId }: Props) {
    return (
        <section className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-cyan-600 shadow-xs">
                        <Sparkles className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-black text-blue-950">
                            Compare with AI prediction
                        </h2>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                            See how your pick lines up with the AI report for
                            this match.
                        </p>
                    </div>
                </div>

                <Button
                    asChild
                    className="justify-center bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950"
                >
                    <Link href={showAiPrediction.url(matchId)}>
                        View AI report
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
