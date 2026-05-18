import MatchCard from '@/components/matches/match-card';
import type { Match } from '@/types/match';

interface Props {
    matches: Match[];
}

export default function MatchList({ matches }: Props) {
    if (matches.length === 0) {
        return (
            <div className="py-12 text-center text-sm text-slate-400">
                No matches found for the selected filters.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
            ))}
        </div>
    );
}
