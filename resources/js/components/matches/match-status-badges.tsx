import { CheckCircle2, Sparkles } from 'lucide-react';
import MatchStatusBadge from '@/components/matches/match-status-badge';
import PredictionAvailabilityBadge from '@/components/matches/prediction/prediction-availability-badge';
import { Badge } from '@/components/ui/feedback/badge';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchStatusBadges({ match }: Props) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <MatchStatusBadge match={match} />
            <PredictionAvailabilityBadge match={match} />

            {match.hasAiPrediction ? (
                <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700 shadow-none">
                    <Sparkles className="h-3 w-3" />
                    AI Ready
                </Badge>
            ) : (
                <Badge
                    aria-label="AI prediction pending"
                    className="border-slate-200 bg-slate-50 text-slate-400 shadow-none"
                >
                    <Sparkles className="h-3 w-3" />
                    AI pending
                </Badge>
            )}

            {match.userPrediction && (
                <Badge className="border-slate-200 bg-slate-50 text-slate-700 shadow-none">
                    <CheckCircle2 className="h-3 w-3" />
                    Your Pick: {match.userPrediction.label}
                </Badge>
            )}
        </div>
    );
}
