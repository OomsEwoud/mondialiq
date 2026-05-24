import { CheckCircle2, Sparkles } from 'lucide-react';
import MatchStatusBadge from '@/components/matches/match-status-badge';
import { Badge } from '@/components/ui/feedback/badge';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchStatusBadges({ match }: Props) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <MatchStatusBadge match={match} />

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
