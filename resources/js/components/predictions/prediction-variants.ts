/**
 * Shared accent token map for AI vs User predictions.
 *
 * AI   → cyan  (analytical, data-driven)
 * User → indigo (personal, owned)
 *
 * Usage:
 *   import { predictionAccent } from '@/components/predictions/prediction-variants';
 *   const accent = predictionAccent['ai'];  // or 'user'
 *   <span className={accent.badge}>AI report</span>
 */
export const predictionAccent = {
    ai: {
        /** Small pill badge: "AI report", "AI prediction", etc. */
        badge: 'border-border bg-accent text-primary',
        /** Square icon wrapper (size-10 / size-9) */
        iconWrap: 'bg-accent text-primary',
        /** Round icon wrapper (size-9) */
        iconWrapRound: 'bg-accent text-primary',
        /** Eyebrow / section label text */
        text: 'text-primary',
        /** Light text on dark hero backgrounds */
        textLight: 'text-primary',
        /** Small icon accent on dark hero backgrounds */
        textIcon: 'text-primary',
        /** Hover text on team links */
        textHover: 'group-hover:text-primary',
        /** Hover text on dark hero team links */
        textHoverDark: 'group-hover:text-primary',
        /** Card border accent */
        border: 'border-border',
        /** Card background tint */
        bg: 'bg-accent',
        /** Subtle hover bg on team cards */
        bgHover: 'hover:bg-accent/30',
        /** Gradient card (score card center, etc.) */
        gradientCard: 'border-border bg-gradient-to-b from-accent/60 to-card',
        /** Progress / toggle bar active color */
        progressBar: 'bg-cyan-500',
        /** Focus ring */
        ring: 'focus-visible:ring-ring',
        /** Horizontal divider line */
        divider: 'bg-cyan-200',
    },
    user: {
        badge: 'border-border bg-accent text-primary',
        iconWrap: 'bg-accent text-primary',
        iconWrapRound: 'bg-accent text-primary',
        text: 'text-primary',
        textLight: 'text-indigo-300',
        textIcon: 'text-indigo-400',
        textHover: 'group-hover:text-primary',
        textHoverDark: 'group-hover:text-indigo-300',
        border: 'border-border',
        bg: 'bg-accent',
        bgHover: 'hover:bg-accent/30',
        gradientCard: 'border-border bg-gradient-to-b from-accent/60 to-card',
        progressBar: 'bg-indigo-500',
        ring: 'focus-visible:ring-ring',
        divider: 'bg-indigo-200',
    },
} as const;

export type PredictionVariant = keyof typeof predictionAccent;
