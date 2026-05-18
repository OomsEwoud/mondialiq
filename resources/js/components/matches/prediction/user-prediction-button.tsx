import { PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    onClick: () => void;
}

export default function UserPredictionButton({ match, onClick }: Props) {
    return (
        <Button
            type="button"
            onClick={onClick}
            className="justify-center bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950"
        >
            <PencilLine className="h-4 w-4" />
            {match.userPrediction ? 'Edit Prediction' : 'Make Prediction'}
        </Button>
    );
}
