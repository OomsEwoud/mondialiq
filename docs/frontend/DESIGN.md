# MondialIQ product redesign

## Product and journey

AI-first football product for comparing match data, AI predictions and measured performance. Main product journey: matches → AI predictions → competitions → AI performance. Personal leaderboards and prediction groups live in Social under the profile menu; their existing backend remains available. Objects: fixtures, teams, players, predictions, standings and leagues. Prediction entry still supports choosing an outcome, optional score/confidence, saving and tracking results. Recovery must preserve input and explain validation, unavailable data and kickoff locks.

## Direction

AI Performance measures one combined MondialiQ prediction engine. Compare the engine's results across competitions, teams, periods, prediction types and confidence bands. Never introduce competing model personas or subscription tiers. Show actual sample sizes, empty states and prediction-versus-result records; preserve the separate Social experience.

An editorial matchday desk: charcoal surfaces, pitch-green accents, warm white text, tabular scores and restrained borders. Preserve the existing football identity and shadcn/Radix behavior. Avoid oversized overview heroes, decorative badges, gradients on every card and competing cyan/indigo visual systems. Marketing can be expressive; operational screens stay compact. League branding and semantic warning/error colors remain meaningful.

## MondialiQ visual system

- **Surfaces:** `background` is the page canvas; `surface` is the quiet base; `surface-elevated` is for focused content; `surface-interactive` is for hover/selection; `surface-highlighted` is reserved for AI and meaningful emphasis. Use `card` only when the content benefits from a distinct panel.
- **Borders:** use `border-subtle` for separators and `border-strong` for controls or clear edges. Green is not a default border color.
- **Text:** use `foreground` for primary information, `text-secondary` for supporting content, `muted-foreground` for metadata and `text-muted` only for tertiary detail. Preserve readable contrast.
- **Status:** use `positive`, `warning`, and `negative` for semantic outcomes; do not reuse brand green to represent every state.
- **Brand:** `primary` is the MondialiQ accent; pair it with `brand-subtle` or `surface-highlighted` for restrained AI/selected treatments.
- **Typography:** use `mq-page-title`, `mq-section-title`, `mq-eyebrow`, and `mq-body-copy` for common hierarchy. Match scores and performance numbers use tabular numerals and lead the football content.
- **Surfaces and spacing:** prefer whitespace and thin separators to nested cards. The shared app shell owns page width and horizontal padding. Keep a consistent medium radius (`rounded-md` controls, `rounded-lg` sections); reserve full rounding for pills and avatars.
- **Controls:** use the shared `Button` variants and `SportsTabs` for navigation/segmented tabs. Keep visible focus, disabled, and responsive behavior.
- **Icons:** inherit neutral text by default; use the brand accent only for AI identity, active navigation, or meaningful positive information.

## Implementation sequence

1. Shared tokens, readable controls, focus, motion and consistent navigation.
2. Compact page headers; unified match, prediction, standings, league, account and information surfaces.
3. Prediction selection, optional scores, validation feedback and accessible controls.
4. Authorization regression and final code/security review.

## Frontend contract

- Keep routes, data contracts, polling, privacy, scoring and all existing features.
- Reuse shadcn primitives and Wayfinder helpers; keep domain components focused.
- Use semantic surface/text/border tokens for shared UI. Keep warning, success and destructive states distinct.
- Every control has a visible or accessible name, visible keyboard focus and an understandable disabled state.
- Overview titles should not displace the primary task below the first viewport.
- Mobile uses usable touch targets, wrapping text and intentional local table scrolling.
- Preserve server-side validation. Inline errors and loading feedback must remain perceivable.

## Verification inventory

Desktop 1440px and mobile 390px/320px: public home, matches and filters/empty results, prediction modes and filters, groups and standings explanation, match/team/player details, login/register/recovery, authenticated dashboard, leaderboards, league creation/join/detail/settings/prediction and account settings. Exercise navigation drawer open/close/Escape, keyboard focus, outcome-only prediction, score-derived outcome, save/edit and rejected submission. Check console errors, overflow, screenshots and response errors. Test backend authorization and existing business regressions; run TypeScript, ESLint, Prettier, Vite, Pest and Pint. Record blocked paths honestly.
