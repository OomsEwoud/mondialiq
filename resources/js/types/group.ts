export interface GroupTeam {
    id: number;
    name: string;
    code: string;
    logo: string | null;
    rank: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalDifference: number;
    points: number;
    qualificationProbability: number;
}

export interface WorldCupGroup {
    id: string;
    name: string;
    teams: GroupTeam[];
}

export interface ThirdPlaceRanking {
    id: 'BEST_3RD';
    name: string;
    teams: GroupTeam[];
}
