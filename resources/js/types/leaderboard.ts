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
    id: number | string;
    name: string;
    icon: string;
    accentColor: LeagueAccentColor;
    coverStyle: LeagueCoverStyle;
    canManage: boolean;
    canLeave: boolean;
    membersCount: number;
    userRank: number | null;
    leaderName: string | null;
    points?: number | null;
    predictionsCount?: number | null;
    href?: string | null;
    settingsHref?: string | null;
    leaveHref?: string | null;
}

export interface LeaderboardsPageProps {
    globalLeaderboard: LeaderboardEntry[];
    currentUserPosition: LeaderboardEntry | null;
    joinedLeagues: JoinedLeague[];
    createLeagueHref: string | null;
    joinLeagueHref: string | null;
    totalPlayers: number;
    currentLeagueCount: number;
    maxLeagueCount: number;
}
