import { useState, useMemo } from 'react';
import MatchFilters from '@/components/matches/match-filters';
import MatchList from '@/components/matches/match-list';
import type { Match } from '@/types/match';

interface Props {
    fixtures: Match[];
}

export default function Matches({ fixtures = []}: Props) {
    const rounds = [...new Set(fixtures.map((m) => m.round))];
    const dates = [...new Set(fixtures.map((m) => m.date))];
    const teams = [...new Set(fixtures.flatMap((m) => [m.homeTeam, m.awayTeam]))].sort();
    const [filters, setFilters] = useState({ round: '', date: '', team: '' });

    const filtered = useMemo(() => {
        return fixtures.filter((m) => {
            if (filters.round && m.round !== filters.round) return false;

            if (filters.date && m.date !== filters.date) return false;

            if (
                filters.team &&
                m.homeTeam !== filters.team &&
                m.awayTeam !== filters.team
            )
                return false;

            return true;
        });
    }, [filters, fixtures]);

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
        </>
    );
}
