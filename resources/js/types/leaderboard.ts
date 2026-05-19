import type { LeagueAccentColor, LeagueCoverStyle } from '@/types/league';

export interface LeaderboardEntry {
    id: number;
    rank: number;
    name: string;
    avatar: string | null;
    predictionsCount: number;
    totalPoints: number;
}

export interface JoinedLeague {
    id: number;
    name: string;
    icon: string;
    accentColor: LeagueAccentColor;
    coverStyle: LeagueCoverStyle;
    canManage: boolean;
    canLeave: boolean;
    membersCount: number;
    userRank: number | null;
    leaderName: string | null;
    points: number | null;
    predictionsCount: number | null;
    href: string;
    settingsHref: string | null;
}

export interface LeaderboardsPageProps {
    globalLeaderboard: LeaderboardEntry[];
    currentUserPosition: LeaderboardEntry | null;
    joinedLeagues: JoinedLeague[];
    createLeagueHref: string;
    joinLeagueHref: string;
    totalPlayers: number;
    currentLeagueCount: number;
    maxLeagueCount: number;
}
