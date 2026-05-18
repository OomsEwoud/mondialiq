import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import PredictionsController from '@/actions/App/Http/Controllers/Pages/PredictionsController';
import { Button } from '@/components/ui/forms/button';

interface Props {
    available: boolean;
}

export default function AiPredictionButton({ available }: Props) {
    if (!available) {
        return (
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
        );
    }

    return (
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
    );
}
