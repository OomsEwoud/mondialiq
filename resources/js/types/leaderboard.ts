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
    membersCount: number;
    userRank: number | null;
    leaderName: string | null;
    points?: number | null;
    predictionsCount?: number | null;
    href?: string | null;
}

export interface JoinedLeaguePayload {
    id: number | string;
    name: string;
    icon: string;
    accent_color: LeagueAccentColor;
    cover_style: LeagueCoverStyle;
    members_count: number;
    user_rank: number | null;
    leader_name: string | null;
    points?: number | null;
    predictions_count?: number | null;
    href?: string | null;
}

export interface LeaderboardsPageProps {
    globalLeaderboard?: LeaderboardEntry[];
    currentUserPosition?: LeaderboardEntry | null;
    joinedLeagues?: Array<JoinedLeague | JoinedLeaguePayload>;
    createLeagueHref?: string | null;
    joinLeagueHref?: string | null;
    globalLeaders?: LeaderboardEntry[];
    currentUserStanding?: LeaderboardEntry | null;
    totalPlayers?: number;
}
