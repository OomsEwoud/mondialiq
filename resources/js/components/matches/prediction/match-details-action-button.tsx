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
            className="justify-center rounded-xl border-slate-200 bg-slate-50 text-slate-700 shadow-none hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-cyan-300"
        >
            <Link href={show.url(matchId)}>
                <BarChart3 className="h-4 w-4" />
                Match details
            </Link>
        </Button>
    );
}
