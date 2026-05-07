export interface UpcomingMatch {
    id: number;
    homeTeam: string;
    homeTeamLogo: string;
    awayTeam: string;
    awayTeamLogo: string;
    day: string;
    time: string;
    round: string;
}

export interface Match {
    id: number;
    homeTeam: string;
    awayTeam: string;
    round: string;
    date: string;
    time: string;
    prediction? : {
        homeWin: number;
        draw: number;
        awayWin: number;
    };
}