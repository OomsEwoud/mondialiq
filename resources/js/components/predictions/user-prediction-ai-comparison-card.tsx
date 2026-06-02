import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show as showAiPrediction } from '@/routes/predictions/ai';

interface Props {
    matchId: number;
}

export default function UserPredictionAiComparisonCard({ matchId }: Props) {
    return (
        <section className="rounded-[1.7rem] border border-cyan-200/70 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.16),transparent_16rem),linear-gradient(180deg,rgba(248,255,255,0.98),rgba(236,254,255,0.88))] p-4 shadow-xl shadow-cyan-950/8 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm shadow-cyan-950/5 ring-1 ring-cyan-100">
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
                    className="justify-center bg-[linear-gradient(135deg,#16255f_0%,#21326e_100%)] text-white shadow-lg shadow-blue-950/20 hover:brightness-105"
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
