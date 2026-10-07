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
            className="justify-center rounded-md border-border-strong bg-surface text-text-secondary shadow-none hover:border-border-strong hover:bg-surface-interactive hover:text-foreground focus-visible:ring-ring"
        >
            <Link href={show.url(matchId)}>
                <BarChart3 className="h-4 w-4" />
                Wedstrijddetails
            </Link>
        </Button>
    );
}
