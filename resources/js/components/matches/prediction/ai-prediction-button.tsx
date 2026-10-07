import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show as showAiPrediction } from '@/routes/predictions/ai';

interface Props {
    available: boolean;
    matchId: number;
}

export default function AiPredictionButton({ available, matchId }: Props) {
    if (!available) {
        return (
            <Button
                disabled
                variant="outline"
                title="De analyse is nog niet beschikbaar"
                aria-label="Analyse volgt"
                className="w-full cursor-not-allowed justify-center rounded-md border-border-subtle bg-surface text-[#59615c] opacity-100 shadow-none"
            >
                <Sparkles className="h-4 w-4" />
                Analyse volgt
            </Button>
        );
    }

    return (
        <Button
            asChild
            variant="outline"
            className="justify-center rounded-md border-border-strong bg-brand-subtle text-positive shadow-none hover:bg-[#203328] hover:text-[#b8e0c7] focus-visible:ring-ring"
        >
            <Link href={showAiPrediction.url(matchId)}>
                <Sparkles className="h-4 w-4" />
                Bekijk analyse
            </Link>
        </Button>
    );
}
