export interface LiveFixtureTeam {
    id: number | null;
    name: string | null;
    code: string | null;
    logo_url: string | null;
}

export interface LiveFixture {
    id: number;
    home_team: LiveFixtureTeam;
    away_team: LiveFixtureTeam;
    league?: {
        name: string | null;
        logo_url: string | null;
    };
    ai_prediction?: {
        home_goals: number | null;
        away_goals: number | null;
    } | null;
    home_goals: number | null;
    away_goals: number | null;
    status_short: string | null;
    status_long: string | null;
    elapsed_time: number | null;
    updated_at: string | null;
}

export interface LiveFixturesResponse {
    data: LiveFixture[];
}
