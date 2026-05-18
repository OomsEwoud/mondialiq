# AGENTS.md

Instructions for AI coding agents working on MondialIQ.

## Project

MondialIQ is a Laravel 13, Inertia.js 3, React 19, TypeScript, and Tailwind CSS 4 application for World Cup 2026 matches, AI predictions, and user predictions.

## Workflow

- Work in small, reviewable commits.
- After each small change, tell the user exactly which files to commit and suggest a concise commit message in dutch.
- Do not create one large mixed commit when the work can be split into backend, frontend, tests, and polish commits.
- Check the current working tree before editing.
- Do not overwrite user changes.
- Prefer existing project patterns over introducing new abstractions.
- Follow Spatie PHP and Laravel style guidelines where applicable.
- Follow the official React documentation and modern React TypeScript best practices.

## Commands

Frontend checks:

```bash
npm run types:check
npm run lint:check
npm run format:check
npm run build
```

Backend checks:

```bash
php artisan test
composer run lint:check
composer run ci:check
```

Run a specific test file:

```bash
php artisan test tests/Feature/MatchPredictionTest.php
```

Regenerate Wayfinder routes after route changes:

```bash
php artisan wayfinder:generate --with-form --no-interaction
```

Useful setup commands:

```bash
composer install
npm install
php artisan migrate
php artisan storage:link
```

## Laravel Rules

- Use Form Request classes for validation.
- Put feature-specific requests in a named subfolder, for example `app/Http/Requests/Predictions`.
- Put feature-specific controllers in a structured controller folder, for example `app/Http/Controllers/Predictions`.
- Prefer invokable controllers for single-action endpoints.
- Use route model binding when possible.
- Use `updateOrCreate` for create-or-update user prediction behavior.
- Add or update Pest tests for backend behavior.
- Protect write endpoints with authentication and appropriate rate limiting.
- Do not rely only on frontend validation for security rules.

## Inertia And Wayfinder

- Use Wayfinder generated route helpers instead of hardcoded URLs.
- After adding or changing routes, regenerate Wayfinder.
- Use Inertia form helpers where they fit the existing frontend pattern.
- Preserve scroll/state intentionally when submitting forms.

## React And TypeScript

- Keep React components small and focused.
- Do not hide multiple large subcomponents at the bottom of one component file.
- Do not keep generic helper functions at the bottom of component files.
- Move reusable helpers into `resources/js/utils`.
- Move shared feature types into `resources/js/types`.
- Use explicit types for form values and callbacks.
- Use `React.FormEvent` via `import type * as React from 'react'` instead of importing `FormEvent` directly.
- Use existing UI components from `resources/js/components/ui`.
- Use `cn` from `@/lib/utils` for conditional class names.

## Component Organization

- General match overview components live in `resources/js/components/matches`.
- User prediction and prediction-form-specific components live in `resources/js/components/matches/prediction`.
- Prediction page components live in `resources/js/components/predictions`.
- Keep root component folders from becoming too flat when a feature grows.

## Styling

- Keep the UI clean, compact, and premium.
- Keep the football/tournament aesthetic.
- Use clear CTA text focused on the user action.
- Use full team names where clarity matters, especially in prediction forms.
- Use compact team codes where scanning is more important, such as dense match rows.
- Mobile-first layouts should remain usable and not overflow.
- Disabled actions should look disabled and use an appropriate cursor.

## User Prediction Rules

- A logged-in user can create or edit one prediction per match.
- A user prediction includes outcome, optional score, and optional confidence.
- Predictions cannot be saved after match start.
- If both score fields are filled, the selected outcome must match the predicted score.
- The match card should show `Make Prediction` or `Edit Prediction`.
- The `My Predictions` view should show a short summary of the user's pick.

## Testing Expectations

- Add Pest tests for backend behavior and regressions.
- Test validation rules that prevent abuse.
- Test route middleware when adding rate limiting or authentication requirements.
- Run the most focused test first, then broader checks when useful.

## Documentation

- Keep `README.md` focused on project setup, commands, deployment notes, and troubleshooting.
- Update `README.md` when setup commands or deployment requirements change.

## Safety

- Never edit `.env` files directly.
- Never commit secrets, API keys, tokens, or credentials.
- Do not run destructive commands such as `migrate:fresh`, `db:wipe`, or `reset` without explicit user approval.
- Ask before deleting files or large sections of code.

## Task Scope

- Keep changes focused on the requested task.
- Do not refactor unrelated code.
- If a larger refactor seems useful, suggest it first instead of doing it immediately.