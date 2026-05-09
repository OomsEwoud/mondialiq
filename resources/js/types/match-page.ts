import type { Match } from "@/types/match";


export interface Filters {
    round: string;
    date: string;
    team: string;
    [key: string]: string;
};

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