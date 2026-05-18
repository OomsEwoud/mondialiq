import { Link } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { show } from '@/routes/matches';

interface Props {
    matchId: number;
}

export default function MatchDetailsActionButton({ matchId }: Props) {
    return (
        <Button
            asChild
            variant="outline"
            className="justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-blue-950"
        >
            <Link href={show.url(matchId)}>
                <BarChart3 className="h-4 w-4" />
                Match Details
            </Link>
        </Button>
    );
}
