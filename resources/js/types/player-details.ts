export interface PlayerDetailsCountry {
    name: string;
    fifaCode: string | null;
    flag: string | null;
}

export interface PlayerDetailsTeam {
    id: number;
    name: string;
    code: string | null;
    logo: string | null;
    country: string | null;
}

export interface PlayerDetailsSeasonStat {
    id: number;
    league: {
        id: number;
        name: string;
        logo: string | null;
    } | null;
    season: number;
    appearances: number | null;
    minutes: number | null;
    position: string | null;
    rating: number | null;
    isCaptain: boolean;
    substitutesIn: number | null;
    substitutesOut: number | null;
    bench: number | null;
    totalShots: number | null;
    shotsOnTarget: number | null;
    goals: number | null;
    goalsConceded: number | null;
    assists: number | null;
    saves: number | null;
    totalPasses: number | null;
    keyPasses: number | null;
    passAccuracy: number | null;
    tackles: number | null;
    blocks: number | null;
    interceptions: number | null;
    totalDuels: number | null;
    duelsWon: number | null;
    dribblesAttempts: number | null;
    dribblesSuccess: number | null;
    dribblesPast: number | null;
    foulsDrawn: number | null;
    foulsCommitted: number | null;
    yellowCards: number | null;
    yellowRedCards: number | null;
    redCards: number | null;
    penaltiesWon: number | null;
    penaltiesCommitted: number | null;
    penaltiesScored: number | null;
    penaltiesMissed: number | null;
    penaltiesSaved: number | null;
}

export interface PlayerDetails {
    id: number;
    externalId: number | null;
    name: string;
    firstName: string | null;
    lastName: string | null;
    birthDate: string | null;
    age: number | null;
    photo: string | null;
    position: string | null;
    number: number | null;
    country: PlayerDetailsCountry | null;
    teams: PlayerDetailsTeam[];
    seasonStats: PlayerDetailsSeasonStat[];
}
