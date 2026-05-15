import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show } from '@/routes/matches';

interface Props {
    matchId: number;
    label: string;
}

export default function PredictionStatusAction({ matchId, label }: Props) {
    return (
        <Button
            asChild
            className="w-fit bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950"
        >
            <Link href={show.url(matchId)}>
                <Sparkles className="h-4 w-4" />
                {label}
                <ArrowRight className="h-4 w-4" />
            </Link>
        </Button>
    );
}
