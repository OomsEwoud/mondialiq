import type {
    LeagueAccentColor,
} from './league';

export interface LeaderboardEntry {
    id: number;
    rank: number;
    name: string;
    avatar: string | null;
    predictionsCount: number;
    totalPoints: number;
    isSystemUser: boolean;
    showOnLeaderboards: boolean;
    predictionsArePublic: boolean;
    publicPredictionsHref: string | null;
}

export interface JoinedLeague {
    id: number;
    name: string;
    description: string | null;
    icon: string;
    memberAvatars: Array<{
        id: number;
        name: string;
        avatar: string | null;
    }>;
    accentColor: LeagueAccentColor;
    canManage: boolean;
    canLeave: boolean;
    membersCount: number;
    rewardTitle: string | null;
    rewardDescription: string | null;
    visibility: 'private' | 'public';
    isActive: boolean;
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
    scoringGuideHref: string;
    totalPlayers: number;
    currentLeagueCount: number;
    maxLeagueCount: number;
}
