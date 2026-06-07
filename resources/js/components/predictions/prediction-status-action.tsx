import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
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
            className="w-full justify-center rounded-xl bg-blue-950 px-5 font-bold text-white shadow-sm hover:bg-blue-900 focus-visible:ring-cyan-300 sm:w-fit"
        >
            <Link href={showAiPrediction.url(matchId)}>
                {label}
                <ArrowRight className="h-4 w-4" />
            </Link>
        </Button>
    );
}
