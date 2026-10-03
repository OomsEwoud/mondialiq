import type { Match } from '@/types/match';

export interface CompetitionSummary {
    id: number;
    name: string;
    type: string;
    logoUrl: string | null;
    country: string | null;
    season: number | null;
    teamsCount: number | null;
    upcomingMatchesCount: number | null;
    currentRound: string | null;
    region?: 'domestic' | 'international';
}

export interface CompetitionTeam {
    id: number;
    name: string;
    code: string | null;
    logoUrl: string | null;
}

export interface CompetitionStandingTeam extends CompetitionTeam {
    rank: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form: string | null;
}

export interface CompetitionStandingGroup {
    name: string;
    advanceCount: number | null;
    teams: CompetitionStandingTeam[];
}

export interface CompetitionTeamStatistic {
    teamId: number | null;
    teamName: string | null;
    teamLogoUrl: string | null;
    form: string | null;
    played: number;
    wins: number;
    goalsFor: number;
    goalsAgainst: number;
    cleanSheets: number;
    goalsForHome: number | null;
    goalsForAway: number | null;
}

export interface CompetitionTopScorer {
    id: number;
    name: string;
    photoUrl: string | null;
    goals: number | null;
    assists: number | null;
    appearances: number | null;
}

export interface CompetitionFixtures {
    upcoming: Match[];
    recent: Match[];
    all: {
        data: Match[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export interface CompetitionPageProps {
    competition: CompetitionSummary;
    tab: 'overview' | 'matches' | 'standings' | 'statistics' | 'teams';
    isWorldCup: boolean;
    standings: CompetitionStandingGroup[];
    fixtures: CompetitionFixtures;
    teams: CompetitionTeam[];
    teamStatistics: CompetitionTeamStatistic[];
    topScorers: CompetitionTopScorer[];
}
