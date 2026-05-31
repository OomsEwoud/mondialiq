import { PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    onClick: () => void;
}

export default function UserPredictionButton({ match, onClick }: Props) {
    const actionLabel = match.userPrediction
        ? 'Edit Prediction'
        : 'Make Prediction';

    return (
        <Button
            type="button"
            onClick={onClick}
            className="justify-center rounded-xl bg-blue-950 text-white shadow-sm hover:bg-blue-900 focus-visible:ring-cyan-300"
        >
            <PencilLine className="h-4 w-4" />
            {actionLabel}
        </Button>
    );
}
