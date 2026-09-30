import type { PlayerPositionGroupKey } from '@/utils/team-players';

export interface SquadPositionFilter {
    key: 'all' | PlayerPositionGroupKey;
    label: string;
}

export const squadPositionFilters: SquadPositionFilter[] = [
    { key: 'all', label: 'Alles' },
    { key: 'goalkeepers', label: 'Doelmannen' },
    { key: 'defenders', label: 'Verdedigers' },
    { key: 'midfielders', label: 'Middenvelders' },
    { key: 'attackers', label: 'Aanvallers' },
];
