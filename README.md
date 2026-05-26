# MondialIQ

MondialIQ is a World Cup 2026 prediction platform built with Laravel, Inertia, React, and Tailwind CSS. The app shows tournament matches, groups, AI prediction insights, and lets authenticated users save their own match predictions.

## Features

- World Cup match overview with filters
- Match detail pages with score, venue, events, and stats
- Group standings and qualification information
- AI prediction overview
- User predictions with create/edit flow
- Social login with Google and Facebook
- Fortify authentication with two-factor support
- Pest test suite

## Tech Stack

- PHP 8.3+
- Laravel 13
- Inertia.js 3
- React 19
- TypeScript
- Tailwind CSS 4
- Pest 4
- Laravel Fortify
- Laravel Wayfinder

## Requirements

Install these before starting:

- PHP 8.3 or newer
- Composer
- Node.js and npm
- MySQL or SQLite

If you use Laravel Herd or Valet, configure the local site URL in `.env`, for example:

```env
APP_URL=https://mondialiq.test
```

## Installation

Install PHP dependencies:

```bash
composer install
```

Install frontend dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

Create the database and run migrations:

```bash
php artisan migrate
```

Create the public storage symlink:

```bash
php artisan storage:link
```

For SQLite, create the database file first if needed:

```bash
touch database/database.sqlite
```

On Windows PowerShell:

```powershell
New-Item database/database.sqlite -ItemType File
```

## Environment Variables

Update `.env` with your local database and API values.

Football API:

```env
API_FOOTBALL_BASE_URL=
API_FOOTBALL_KEY=
WORLD_CUP_LEAGUE_ID=
WORLD_CUP_SEASON_YEAR=2026
```

Social login:

```env
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI="${APP_URL}/auth/facebook/callback"

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

## Development

Start the full local development stack:

```bash
composer run dev
```

This runs:

- Laravel server
- Queue listener
- Vite dev server

You can also run services separately:

```bash
php artisan serve
npm run dev
php artisan queue:listen --tries=1
```

## Database And Data Sync

Run migrations:

```bash
php artisan migrate
```

Reset the database:

```bash
php artisan migrate:fresh
```

Seed the database:

```bash
php artisan db:seed
```

Sync all football data:

```bash
php artisan app:sync-all-data
```

Sync World Cup data and prediction context for a server/bootstrap run:

```bash
php artisan app:sync-world-cup-data
```

Available import commands include:

```bash
php artisan app:add-countries
php artisan app:add-leagues
php artisan app:add-teams
php artisan app:add-venues
php artisan app:add-fixtures
php artisan app:add-fixture-data
php artisan app:add-standings
php artisan app:add-predictions
```

## Frontend Commands

Run Vite:

```bash
npm run dev
```

Build production assets:

```bash
npm run build
```

Check TypeScript:

```bash
npm run types:check
```

Run ESLint:

```bash
npm run lint:check
```

Format frontend files:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

## Backend Commands

Run Laravel Pint:

```bash
composer run lint
```

Check Laravel Pint formatting:

```bash
composer run lint:check
```

Regenerate Wayfinder routes after route changes:

```bash
php artisan wayfinder:generate --with-form --no-interaction
```

Clear caches:

```bash
php artisan optimize:clear
```

Create the public storage symlink:

```bash
php artisan storage:link
```

## Testing

Run the full test suite:

```bash
php artisan test
```

Run one test file:

```bash
php artisan test tests/Feature/MatchPredictionTest.php
```

Run the project test script:

```bash
composer run test
```

Run all CI checks:

```bash
composer run ci:check
```

## Prediction Flow

Users can create or edit one prediction per match. The prediction endpoint uses `updateOrCreate`, so saving again updates the existing record instead of creating duplicates.

Prediction validation includes:

- A winner outcome is required
- Optional score fields must be numeric
- Predictions are blocked after match start
- If both scores are filled, the selected outcome must match the predicted score
- The endpoint is rate limited

## Useful URLs

- Matches: `/matches`
- Match details: `/matches/{fixture}`
- AI predictions: `/predictions?mode=ai`
- My predictions: `/predictions?mode=mine`
- Groups: `/groups`
- Login: `/login`
- Register: `/register`

## Troubleshooting

If TypeScript cannot find generated routes, regenerate Wayfinder:

```bash
php artisan wayfinder:generate --with-form --no-interaction
```

If Vite assets are stale:

```bash
npm run dev
```

If Laravel config or routes are stale:

```bash
php artisan optimize:clear
```

If Facebook login appends `#_=_` to the URL, the frontend removes it automatically on app startup.
