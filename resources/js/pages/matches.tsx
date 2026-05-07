import { Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import MatchFilters from '@/components/matches/match-filters';
import MatchList from '@/components/matches/match-list';
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

            <div className="mt-8 flex flex-wrap justify-center gap-1">
                {fixtures.links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || '#'}
                        className={`rounded-lg border px-4 py-2 text-sm ${
                            link.active
                                ? 'border-rose-600 bg-rose-600 text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                        // Gebruik dangerouslySetInnerHTML omdat Laravel '&laquo; Previous' als label stuurt
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveScroll // Belangrijk: voorkomt dat de pagina naar boven springt bij klikken
                    />
                ))}
            </div>
        </>
    );
}
