export interface TeamDetailsCountry {
    name: string;
    fifaCode: string;
    flag: string | null;
}

export interface TeamDetailsCoach {
    name: string;
    firstName: string | null;
    lastName: string | null;
    birthDate: string | null;
    photo: string | null;
    country: string | null;
}

export interface TeamDetailsPlayer {
    id: number;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    birthDate: string | null;
    photo: string | null;
    position: string | null;
    number: number | null;
    country: string | null;
}

export interface TeamDetails {
    id: number;
    name: string;
    code: string | null;
    logo: string;
    foundedAt: number | null;
    country: TeamDetailsCountry | null;
    coach: TeamDetailsCoach | null;
    activePlayers: TeamDetailsPlayer[];
}
