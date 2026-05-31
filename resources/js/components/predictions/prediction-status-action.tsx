import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show as showAiPrediction } from '@/routes/predictions/ai';

interface Props {
    matchId: number;
    label: string;
}

export default function PredictionStatusAction({ matchId, label }: Props) {
    return (
        <Button
            asChild
            className="w-full justify-center rounded-xl bg-blue-950 text-white shadow-sm hover:bg-blue-900 focus-visible:ring-cyan-300 sm:w-fit"
        >
            <Link href={showAiPrediction.url(matchId)}>
                <Sparkles className="h-4 w-4" />
                {label}
                <ArrowRight className="h-4 w-4" />
            </Link>
        </Button>
    );
}
