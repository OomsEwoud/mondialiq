import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show as showAiPrediction } from '@/routes/predictions/ai';

interface Props {
    matchId: number;
}

export default function UserPredictionAiComparisonCard({ matchId }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-cyan-50/40 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                        <Sparkles className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900">
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
                    className="justify-center bg-slate-900 text-white shadow-sm "
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
