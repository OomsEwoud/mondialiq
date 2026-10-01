import {
    dashboard,
    groups,
    leaderboards,
    matches,
    predictions,
} from '@/routes';

export const navItems = [
    { label: 'Overzicht', href: dashboard() },
    { label: 'Wedstrijden', href: matches() },
    { label: 'Voorspellingen', href: predictions() },
    { label: 'Groepsstand', href: groups() },
    { label: 'Ranglijsten', href: leaderboards() },
] as const;
