import type { Match } from '@/types/match';

export interface Filters {
    round: string;
    date: string;
    team: string;
    status: MatchStatusFilter;
}

export type FilterKey = keyof Filters;

export type MatchStatusFilter = 'all' | 'live' | 'upcoming' | 'played';

export interface MatchPageProps {
    fixtures: {
        data: Match[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filterOptions: {
        rounds: Array<{ label: string; value: string }>;
        dates: Array<{ label: string; value: string }>;
        teams: string[];
    };
    filters: Filters;
}
