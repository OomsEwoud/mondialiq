export interface MatchDetailsTeam {
    id: number;
    name: string;
    code: string;
    logo: string;
}

export interface MatchDetailsScoreLine {
    home: number | null;
    away: number | null;
}

export interface MatchDetailsVenue {
    name: string;
    city: string | null;
    country: string | null;
    capacity: number | null;
    photo: string | null;
}

export interface MatchDetailsEvent {
    id: number;
    minute: number;
    extraTime: number | null;
    team: string;
    teamLogo: string;
    player: string | null;
    assist: string | null;
    type: string;
    detail: string;
}

export interface MatchDetailsStat {
    name: string;
    home: number | null;
    away: number | null;
}

export interface MatchDetailsLineupPlayerStats {
    minutes: number | null;
    rating: number | null;
    goals: number | null;
    assists: number | null;
    shotsTotal: number | null;
    shotsOnTarget: number | null;
    passesTotal: number | null;
    keyPasses: number | null;
    passAccuracy: number | null;
    tackles: number | null;
    interceptions: number | null;
    duelsTotal: number | null;
    duelsWon: number | null;
    dribblesAttempts: number | null;
    dribblesSuccess: number | null;
    foulsDrawn: number | null;
    foulsCommitted: number | null;
    yellowCards: number | null;
    redCards: number | null;
    saves: number | null;
}

export interface MatchDetailsLineupPlayer {
    id: number;
    playerId: number;
    name: string;
    number: number | null;
    position: string | null;
    photo: string | null;
    isCaptain: boolean;
    stats: MatchDetailsLineupPlayerStats | null;
}

export interface MatchDetailsLineupTeam {
    formation: string | null;
    starters: MatchDetailsLineupPlayer[];
    substitutes: MatchDetailsLineupPlayer[];
}

export interface MatchDetailsMissingPlayer {
    id: number;
    name: string;
    photo: string | null;
    number: number | null;
    position: string | null;
    country: string | null;
    type: string | null;
    reason: string | null;
}

export interface MatchDetails {
    id: number;
    homeTeam: MatchDetailsTeam;
    awayTeam: MatchDetailsTeam;
    round: string;
    season: number;
    date: string;
    dateValue: string;
    time: string;
    kickoffAt: string;
    statusShort: string | null;
    status: string;
    elapsedTime: number | null;
    hasAiPrediction: boolean;
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
    } | null;
    score: {
        halftime: MatchDetailsScoreLine;
        fulltime: MatchDetailsScoreLine;
        extratime: MatchDetailsScoreLine;
        penalties: MatchDetailsScoreLine;
    };
    venue: MatchDetailsVenue | null;
    referee: string | null;
    events: MatchDetailsEvent[];
    stats: MatchDetailsStat[];
    lineups: {
        home: MatchDetailsLineupTeam;
        away: MatchDetailsLineupTeam;
    };
    availability: {
        home: MatchDetailsMissingPlayer[];
        away: MatchDetailsMissingPlayer[];
    };
}
