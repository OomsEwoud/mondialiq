import { dashboard, groups, matches, predictions } from '@/routes';

export const navItems = [
    { label: 'Home', href: dashboard() },
    { label: 'Wedstrijden', href: matches() },
    { label: 'Predictions', href: predictions() },
    { label: 'Competities', href: groups() },
] as const;
