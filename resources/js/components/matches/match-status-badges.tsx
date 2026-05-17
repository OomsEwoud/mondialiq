import { CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/feedback/badge';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchStatusBadges({ match }: Props) {
    const hasBadges = match.hasAiPrediction || match.userPrediction;

    if (!hasBadges) {
        return null;
    }

    return (
        <div className="mb-3 flex flex-wrap items-center gap-2">
            {match.hasAiPrediction && (
                <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700">
                    <Sparkles className="h-3 w-3" />
                    AI Ready
                </Badge>
            )}

            {match.userPrediction && (
                <Badge className="border-blue-200 bg-blue-50 text-blue-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Your Pick: {match.userPrediction.label}
                </Badge>
            )}
        </div>
    );
}
