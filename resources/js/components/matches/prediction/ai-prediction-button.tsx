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
                title="AI prediction is not available yet"
                aria-label="AI prediction is not available yet"
                className="w-full cursor-not-allowed justify-center rounded-xl border-slate-200 bg-slate-50 text-slate-400 opacity-100 shadow-none"
            >
                <Sparkles className="h-4 w-4" />
                AI Pending
            </Button>
        );
    }

    return (
        <Button
            asChild
            variant="outline"
            className="justify-center rounded-xl border-cyan-200 bg-cyan-50 text-cyan-700 shadow-none hover:bg-cyan-100 hover:text-cyan-900 focus-visible:ring-cyan-300"
        >
            <Link href={showAiPrediction.url(matchId)}>
                <Sparkles className="h-4 w-4" />
                View AI Prediction
            </Link>
        </Button>
    );
}
