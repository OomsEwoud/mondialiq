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
        badge: 'border-cyan-200 bg-cyan-50 text-cyan-700',
        /** Square icon wrapper (size-10 / size-9) */
        iconWrap: 'bg-cyan-50 text-cyan-600',
        /** Round icon wrapper (size-9) */
        iconWrapRound: 'bg-cyan-100 text-cyan-700',
        /** Eyebrow / section label text */
        text: 'text-cyan-600',
        /** Light text on dark hero backgrounds */
        textLight: 'text-cyan-300',
        /** Small icon accent on dark hero backgrounds */
        textIcon: 'text-cyan-400',
        /** Hover text on team links */
        textHover: 'group-hover:text-cyan-700',
        /** Hover text on dark hero team links */
        textHoverDark: 'group-hover:text-cyan-300',
        /** Card border accent */
        border: 'border-cyan-200',
        /** Card background tint */
        bg: 'bg-cyan-50',
        /** Subtle hover bg on team cards */
        bgHover: 'hover:bg-cyan-50/30',
        /** Gradient card (score card center, etc.) */
        gradientCard: 'border-cyan-200 bg-gradient-to-b from-cyan-50/60 to-white',
        /** Progress / toggle bar active color */
        progressBar: 'bg-cyan-500',
        /** Focus ring */
        ring: 'focus-visible:ring-cyan-300',
        /** Horizontal divider line */
        divider: 'bg-cyan-200',
    },
    user: {
        badge: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        iconWrap: 'bg-indigo-50 text-indigo-600',
        iconWrapRound: 'bg-indigo-100 text-indigo-700',
        text: 'text-indigo-600',
        textLight: 'text-indigo-300',
        textIcon: 'text-indigo-400',
        textHover: 'group-hover:text-indigo-700',
        textHoverDark: 'group-hover:text-indigo-300',
        border: 'border-indigo-200',
        bg: 'bg-indigo-50',
        bgHover: 'hover:bg-indigo-50/30',
        gradientCard:
            'border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white',
        progressBar: 'bg-indigo-500',
        ring: 'focus-visible:ring-indigo-300',
        divider: 'bg-indigo-200',
    },
} as const;

export type PredictionVariant = keyof typeof predictionAccent;
