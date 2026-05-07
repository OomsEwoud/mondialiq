import { useState, useMemo } from 'react';
import MatchFilters from '@/components/matches/match-filters';
import MatchList from '@/components/matches/match-list';
import type { Match } from '@/types/match';

const mockMatches: Match[] = [
    {
        id: 1,
        home: 'USA', away: 'MEX',
        round: 'Group Stage - Matchday 1',
        date: 'Jun 12', time: '15:00',
        prediction: { homeWin: 45, draw: 30, awayWin: 25 },
    },
    {
        id: 2,
        home: 'CAN', away: 'URU',
        round: 'Group Stage - Matchday 1',
        date: 'Jun 12', time: '18:00',
        prediction: { homeWin: 35, draw: 25, awayWin: 40 },
    },
    {
        id: 3,
        home: 'BRA', away: 'ARG',
        round: 'Group Stage - Matchday 2',
        date: 'Jun 13', time: '21:00',
        prediction: { homeWin: 50, draw: 20, awayWin: 30 },
    },
    {
        id: 4,
        home: 'GER', away: 'ESP',
        round: 'Group Stage - Matchday 2',
        date: 'Jun 14', time: '18:00',
        prediction: { homeWin: 38, draw: 28, awayWin: 34 },
    },
];

const rounds = [...new Set(mockMatches.map((m) => m.round))];
const dates  = [...new Set(mockMatches.map((m) => m.date))];
const teams  = [...new Set(mockMatches.flatMap((m) => [m.home, m.away]))].sort();


export default function Matches() {
    const [filters, setFilters] = useState({ round: '', date: '', team: '' });

    const filtered = useMemo(() => {
        return mockMatches.filter((m) => {

            if (filters.round && m.round !== filters.round) return false;

            if (filters.date  && m.date  !== filters.date)  return false;

            if (filters.team  && m.home  !== filters.team && m.away !== filters.team) return false;
            
            return true;
        });
    }, [filters]);

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
