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
            className="flex flex-col gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-sm font-medium text-primary">
                AI-voorspelling beschikbaar
            </p>
            <Button asChild className="min-h-11 w-full sm:w-auto">
                <Link href={showAiPrediction.url(match.id)}>
                    <Sparkles aria-hidden="true" />
                    Bekijk AI-voorspelling
                    <ArrowUpRight aria-hidden="true" />
                </Link>
            </Button>
        </section>
    );
}
