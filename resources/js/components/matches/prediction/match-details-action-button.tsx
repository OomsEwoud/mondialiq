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
            className="justify-center rounded-md border-[#343d37] bg-[#0d110f] text-[#b8bfba] shadow-none hover:border-[#536159] hover:bg-[#1a211d] hover:text-white focus-visible:ring-[#57ad78]"
        >
            <Link href={show.url(matchId)}>
                <BarChart3 className="h-4 w-4" />
                Wedstrijddetails
            </Link>
        </Button>
    );
}
