import { useState, useMemo } from 'react';
import MatchFilters from '@/components/matches/match-filters';
import MatchList from '@/components/matches/match-list';
import Pagination from '@/components/navigation/pagination';
import type { Match } from '@/types/match';

interface Props {
    fixtures: {
        data: Match[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export default function Matches({ fixtures }: Props) {
    const safeMatches = fixtures.data;
    const rounds = [...new Set(safeMatches.map((m) => m.round))];
    const dates = [...new Set(safeMatches.map((m) => m.date))];
    const teams = [
        ...new Set(safeMatches.flatMap((m) => [m.homeTeam, m.awayTeam])),
    ].sort();
    const [filters, setFilters] = useState({ round: '', date: '', team: '' });

    const filtered = useMemo(() => {
        return safeMatches.filter((m) => {
            if (filters.round && m.round !== filters.round) {
                return false;
            }

            if (filters.date && m.date !== filters.date) {
                return false;
            }

            if (
                filters.team &&
                m.homeTeam !== filters.team &&
                m.awayTeam !== filters.team
            ) {
                return false;
            }

            return true;
        });
    }, [filters, safeMatches]);

    const handleChange = (key: 'round' | 'date' | 'team', value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <>
            <h1 className="mb-6 bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-center text-4xl font-bold text-transparent">
                All Matches
            </h1>

            <MatchFilters
                rounds={rounds}
                dates={dates}
                teams={teams}
                selected={filters}
                onChange={handleChange}
            />

            <MatchList matches={filtered} />
            <Pagination links={fixtures.links} />
        </>
    );
}
