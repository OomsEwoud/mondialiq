import { groups, home, matches, predictions } from '@/routes';

export const navItems = [
    { label: 'Home', href: home() },
    { label: 'Matches', href: matches() },
    { label: 'Groups', href: groups() },
    { label: 'Predictions', href: predictions() },
] as const;
