import { Link } from '@inertiajs/react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show as showAiPrediction } from '@/routes/predictions/ai';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchPredictionActionRow({ match }: Props) {
    if (!match.hasAiPrediction) {
        return null;
    }

    return (
        <section
            aria-label="AI-voorspelling"
            className="flex flex-col gap-4 rounded-lg border-y border-border/50 bg-gradient-to-r from-primary/[0.07] via-card/40 to-transparent px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6"
        >
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles aria-hidden="true" className="size-4" />
                </span>
                <div>
                    <p className="text-xs font-semibold tracking-wide text-primary">
                        AI-MATCHINZICHT
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                        Bekijk de voorspelling en analyse voor deze wedstrijd.
                    </p>
                </div>
            </div>
            <Button asChild className="min-h-11 w-full sm:w-auto">
                <Link href={showAiPrediction.url(match.id)}>
                    Bekijk AI-analyse
                    <ArrowUpRight aria-hidden="true" />
                </Link>
            </Button>
        </section>
    );
}
