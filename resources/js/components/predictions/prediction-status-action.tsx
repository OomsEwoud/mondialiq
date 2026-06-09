import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show as showAiPrediction } from '@/routes/predictions/ai';

interface Props {
    matchId: number;
    label: string;
    href?: string;
}

export default function PredictionStatusAction({ matchId, label, href }: Props) {
    return (
        <Button
            asChild
            className="w-full justify-center rounded-lg bg-slate-900 px-5 font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:ring-cyan-300 sm:w-fit"
        >
            <Link href={href ?? showAiPrediction.url(matchId)}>
                {label}
                <ArrowRight className="h-4 w-4" />
            </Link>
        </Button>
    );
}
