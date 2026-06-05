export interface LeagueMember {
    id: number;
    rank: number;
    name: string;
    avatar: string | null;
    predictionsCount: number;
    scoringPredictionsCount: number;
    perfectPredictionsCount: number;
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

export type LeagueCoverStyle = 'stadium' | 'spotlight' | 'pitch' | 'night';

export interface LeagueDetails {
    id: number;
    name: string;
    description: string | null;
    icon: string;
    accentColor: LeagueAccentColor;
    coverStyle: LeagueCoverStyle;
    code: string;
    rewardTitle: string | null;
    rewardDescription: string | null;
    visibility: 'private' | 'public';
    isActive: boolean;
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
        | 'id'
        | 'name'
        | 'description'
        | 'icon'
        | 'accentColor'
        | 'coverStyle'
        | 'code'
        | 'rewardTitle'
        | 'rewardDescription'
        | 'visibility'
        | 'isActive'
        | 'showHref'
        | 'joinHref'
        | 'settingsHref'
        | 'canManage'
        | 'membersCount'
        | 'members'
    >;
}
