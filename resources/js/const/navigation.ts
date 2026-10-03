import CompetitionsController from '@/actions/App/Http/Controllers/Pages/CompetitionsController';
import { dashboard, leaderboards, matches, predictions } from '@/routes';

export const navItems = [
    { label: 'Overzicht', href: dashboard() },
    { label: 'Wedstrijden', href: matches() },
    { label: 'Voorspellingen', href: predictions() },
    { label: 'Competities', href: CompetitionsController.url() },
    { label: 'Ranglijsten', href: leaderboards() },
] as const;
