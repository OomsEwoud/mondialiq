export interface LeagueMember {
    id: number;
    rank: number;
    name: string;
    avatar: string | null;
    predictionsCount: number;
    totalPoints: number;
    isCurrentUser: boolean;
}

export interface LeagueDetails {
    id: number;
    name: string;
    code: string;
    joinHref: string;
    membersCount: number;
    currentLeader: string | null;
    members: LeagueMember[];
    currentUserRank: number | null;
}

export interface LeagueJoinPageProps {
    initialCode: string;
}

export interface LeagueDetailsPageProps {
    league: LeagueDetails;
}
