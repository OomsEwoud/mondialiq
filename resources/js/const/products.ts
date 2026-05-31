import type { LucideIcon } from 'lucide-react';
import { BrainCircuit, ChartNoAxesColumn, Trophy } from 'lucide-react';
import { groups, login, predictions } from '@/routes';

export type ProductCard = {
    title: string;
    description: string;
    badge: string;
    cta: string;
    href: string;
    icon: LucideIcon;
    featured?: boolean;
};

export const products: ProductCard[] = [
    {
        title: 'AI Match Predictions',
        description:
            'Every match modeled with win, draw and loss probabilities plus a short model insight.',
        badge: 'Public',
        cta: 'Browse predictions',
        href: predictions.url(),
        icon: BrainCircuit,
    },
    {
        title: 'Group Qualification Chances',
        description:
            'Live standings with model-based qualification percentages for the knockout stage.',
        badge: 'Public',
        cta: 'View groups',
        href: groups.url(),
        icon: ChartNoAxesColumn,
        featured: true,
    },
    {
        title: 'Personal Prediction League',
        description:
            'Lock in your scores, build your bracket and compete in a private leaderboard with friends.',
        badge: 'Login required',
        cta: 'Start playing',
        href: login.url(),
        icon: Trophy,
    },
];
