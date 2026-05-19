export interface LeagueMember {
    id: number;
    rank: number;
    name: string;
    avatar: string | null;
    predictionsCount: number;
    scoringPredictionsCount: number;
    totalPoints: number;
    isCurrentUser: boolean;
    isOwner: boolean;
    canBeManaged: boolean;
    lastPredictionLabel: string | null;
    gapToAbove: number | null;
    form: {
        label: string;
        tone: 'hot' | 'steady' | 'chasing' | 'cold' | 'neutral';
    };
}

export type LeagueAccentColor =
    | 'cyan'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'violet'
    | 'blue';

export type LeagueCoverStyle =
    | 'stadium'
    | 'spotlight'
    | 'pitch'
    | 'night';

export interface LeagueDetails {
    id: number;
    name: string;
    icon: string;
    accentColor: LeagueAccentColor;
    coverStyle: LeagueCoverStyle;
    code: string;
    showHref?: string | null;
    joinHref: string;
    settingsHref?: string | null;
    canManage: boolean;
    canLeave: boolean;
    membersCount: number;
    currentLeader: string | null;
    leaderPoints: number;
    currentUserPoints: number;
    totalPredictions: number;
    lastActivityLabel: string | null;
    gapToLeader: {
        points: number;
        summary: string;
    };
    members: LeagueMember[];
    currentUserRank: number | null;
}

export interface LeagueJoinPageProps {
    initialCode: string;
    currentLeagueCount: number;
    maxLeagueCount: number;
    hasReachedLeagueLimit: boolean;
}

export interface LeagueCreatePageProps {
    currentLeagueCount: number;
    maxLeagueCount: number;
    hasReachedLeagueLimit: boolean;
}

export interface LeagueDetailsPageProps {
    league: LeagueDetails;
}

export interface LeagueSettingsPageProps {
    league: Pick<
        LeagueDetails,
        'id' | 'name' | 'icon' | 'accentColor' | 'coverStyle' | 'code' | 'showHref' | 'joinHref' | 'settingsHref' | 'canManage' | 'membersCount' | 'members'
    >;
}
