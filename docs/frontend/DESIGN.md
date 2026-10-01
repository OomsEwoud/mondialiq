# MondialIQ product redesign

## Product and journey

Existing, functioning football product for fans comparing match data, making predictions and competing in leagues. Objects: fixtures, teams, players, predictions, standings and leagues. Main journey: discover a match → inspect evidence → choose an outcome → optionally add score/confidence → save → track results. Recovery must preserve input and explain validation, unavailable data and kickoff locks. On mobile, match selection and saving a prediction take priority.

## Direction

An editorial matchday desk: charcoal surfaces, pitch-green accents, warm white text, tabular scores and restrained borders. Preserve the existing football identity and shadcn/Radix behavior. Avoid oversized overview heroes, decorative badges, gradients on every card and competing cyan/indigo visual systems. Marketing can be expressive; operational screens stay compact. League branding and semantic warning/error colors remain meaningful.

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
