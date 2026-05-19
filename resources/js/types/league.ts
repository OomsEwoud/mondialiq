export interface LeagueMember {
    id: number;
    rank: number;
    name: string;
    avatar: string | null;
    predictionsCount: number;
    totalPoints: number;
    isCurrentUser: boolean;
    isOwner: boolean;
    canBeManaged: boolean;
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
