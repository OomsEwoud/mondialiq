import type { Match } from './match';

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
    isSystemUser: boolean;
    role?: string;
    joinedAt?: string | null;
    lastPredictionLabel?: string | null;
    gapToAbove?: number | null;
    form?: {
        label: string;
        tone: 'hot' | 'steady' | 'chasing' | 'cold' | 'neutral';
    };
    predictionsHref?: string | null;
}

export type LeagueAccentColor =
    | 'cyan'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'violet'
    | 'blue';


export interface ScoringRules {
    exact_score_points: number;
    correct_result_points: number;
    correct_goal_difference_points: number;
    correct_home_goals_points: number;
    correct_away_goals_points: number;
    boosted_predictions_enabled: boolean;
    boosted_predictions_limit: number;
    boosted_confidence_threshold: 'low' | 'medium' | 'high';
    boosted_prediction_bonus_points: number;
}

export interface LeagueDetails {
    id: number;
    name: string;
    description: string | null;
    icon: string;
    accentColor: LeagueAccentColor;
    code: string;
    rewardTitle: string | null;
    rewardDescription: string | null;
    visibility: 'private' | 'public';
    isActive: boolean;
    scoringRules: ScoringRules;
    showHref?: string | null;
    joinHref: string;
    predictHref?: string | null;
    settingsHref?: string | null;
    membersHref?: string | null;
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
    boostedPredictionsEnabled: boolean;
    boostsRemaining: number | null;
}

export interface LeaguePredictPageProps {
    league: LeagueDetails;
    fixtures: {
        data: Match[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export interface PublicLeague {
    id: number;
    name: string;
    description: string | null;
    icon: string;
    accent_color: LeagueAccentColor;
    users_count: number;
}

export interface LeagueJoinPageProps {
    initialCode: string;
    currentLeagueCount: number;
    maxLeagueCount: number;
    hasReachedLeagueLimit: boolean;
    publicLeagues: PublicLeague[];
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
        | 'code'
        | 'rewardTitle'
        | 'rewardDescription'
        | 'visibility'
        | 'isActive'
        | 'scoringRules'
        | 'showHref'
        | 'joinHref'
        | 'settingsHref'
        | 'membersHref'
        | 'canManage'
        | 'membersCount'
    >;
}

export interface LeagueMembersPageProps {
    league: Pick<
        LeagueDetails,
        | 'id'
        | 'name'
        | 'icon'
        | 'accentColor'
        | 'code'
        | 'settingsHref'
        | 'showHref'
        | 'membersCount'
    >;
    members: LeagueMember[];
}
