import MatchCard from '@/components/matches/match-card';
import type { Match } from '@/types/match';

interface Props {
    matches: Match[];
}

export default function MatchList({ matches }: Props) {
    if (matches.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
                <p className="text-sm font-black text-blue-950">
                    No matches found.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    Try changing your filters.
                </p>
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
