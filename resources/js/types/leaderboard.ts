export interface LeaderboardEntry {
    id: number;
    rank: number;
    name: string;
    avatar: string | null;
    predictionsCount: number;
    totalPoints: number;
}

export interface LeaderboardsPageProps {
    globalLeaders: LeaderboardEntry[];
    currentUserStanding: LeaderboardEntry | null;
    totalPlayers: number;
}
