import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show as showAiPrediction } from '@/routes/predictions/ai';

interface Props {
    matchId: number;
}

export default function UserPredictionAiComparisonCard({ matchId }: Props) {
    return (
        <section className="rounded-2xl border border-border bg-gradient-to-b from-accent/40 to-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm ring-1 ring-ring">
                        <Sparkles className="size-5" />
                    </span>
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Compare with AI prediction
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            See how your pick lines up with the AI report.
                        </p>
                    </div>
                </div>
                <Button
                    asChild
                    className="justify-center bg-secondary text-white shadow-sm"
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
