import type { LucideIcon } from 'lucide-react';
import { Activity, BrainCircuit, Trophy } from 'lucide-react';
import { leaderboards, matches, predictions } from '@/routes';

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
        title: 'Personal Prediction League',
        description:
            'Lock in your scores, build your bracket and compete in a private leaderboard with friends.',
        badge: 'Login required',
        cta: 'Start playing',
        href: leaderboards.url(),
        icon: Trophy,
    },
    {
        title: 'Live Match Center',
        description:
            'Follow fixtures, live scores, lineups and match events in one focused match view.',
        badge: 'LIVE DATA',
        cta: 'Explore matches',
        href: matches.url(),
        icon: Activity,
    },
];
