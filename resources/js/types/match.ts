export interface UpcomingMatch {
    id: number;
    homeTeam: string;
    homeTeamShort: string;
    homeTeamLogo: string;
    awayTeam: string;
    awayTeamShort: string;
    awayTeamLogo: string;
    day: string;
    time: string;
    round: string;
}

export interface Match {
    id: number;
    homeTeamId: number;
    homeTeam: string;
    homeTeamShort: string;
    homeTeamLogo: string;
    awayTeamId: number;
    awayTeam: string;
    awayTeamShort: string;
    awayTeamLogo: string;
    round: string;
    date: string;
    dateValue: string;
    time: string;
    prediction?: {
        homeWin: number;
        draw: number;
        awayWin: number;
    } | null;
    hasAiPrediction?: boolean;
    userPrediction?: {
        winnerId: number | null;
        outcome: 'home' | 'draw' | 'away';
        label: string;
        homeScore: number | null;
        awayScore: number | null;
        confidence: 'low' | 'medium' | 'high' | null;
    } | null;
}
