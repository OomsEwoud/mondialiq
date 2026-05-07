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
    homeTeam: string;
    homeTeamShort: string;
    homeTeamLogo: string;
    awayTeam: string;
    awayTeamShort: string;
    awayTeamLogo: string;
    round: string;
    date: string;
    time: string;
    prediction? : {
        homeWin: number;
        draw: number;
        awayWin: number;
    };
}