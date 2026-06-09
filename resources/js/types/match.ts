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
    kickoffAt: string;
    round: string;
    statusShort: string | null;
    statusLong: string | null;
    hasLineups: boolean;
    predictionState: 'predicted' | 'missing' | null;
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
    kickoffAt: string;
    status: string;
    elapsedTime: number | null;
    score: {
        fulltime: MatchScore;
        extratime: MatchScore;
        penalties: MatchScore;
    };
    prediction?: {
        homeWin: number;
        draw: number;
        awayWin: number;
    } | null;
    hasAiPrediction?: boolean;
    aiPrediction?: {
        winnerId: number | null;
        outcome: 'home' | 'draw' | 'away';
        label: string;
        homeScore: number | null;
        awayScore: number | null;
        confidence: string | null;
        points: number | null;
        pointsAwarded: boolean;
        validatedAt: string | null;
        advice: string | null;
        isBoosted?: boolean;
    } | null;
    userPrediction?: {
        winnerId: number | null;
        outcome: 'home' | 'draw' | 'away';
        label: string;
        homeScore: number | null;
        awayScore: number | null;
        confidence: 'low' | 'medium' | 'high' | null;
        points: number | null;
        pointsAwarded: boolean;
        validatedAt: string | null;
        isBoosted?: boolean;
    } | null;
}

export interface MatchScore {
    home: number | null;
    away: number | null;
}
