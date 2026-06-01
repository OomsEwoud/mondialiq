import type { PlayerPositionGroupKey } from '@/utils/team-players';

export interface SquadPositionFilter {
    key: 'all' | PlayerPositionGroupKey;
    label: string;
}

export const squadPositionFilters: SquadPositionFilter[] = [
    { key: 'all', label: 'All' },
    { key: 'goalkeepers', label: 'Goalkeepers' },
    { key: 'defenders', label: 'Defenders' },
    { key: 'midfielders', label: 'Midfielders' },
    { key: 'attackers', label: 'Attackers' },
];
