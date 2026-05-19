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

export interface LeagueDetails {
    id: number;
    name: string;
    code: string;
    showHref?: string | null;
    joinHref: string;
    settingsHref?: string | null;
    canManage: boolean;
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
}

export interface LeagueDetailsPageProps {
    league: LeagueDetails;
}

export interface LeagueSettingsPageProps {
    league: Pick<
        LeagueDetails,
        'id' | 'name' | 'code' | 'showHref' | 'joinHref' | 'settingsHref' | 'canManage' | 'membersCount' | 'members'
    >;
}
