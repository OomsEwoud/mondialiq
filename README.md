# MondialIQ

MondialIQ is a football prediction platform built with Laravel, Inertia, React, and Tailwind CSS. The app brings competitions, matches, standings, AI prediction insights, and user predictions together.

## Features

- Match overview across available competitions
- Match detail pages with score, venue, events, and stats
- Group standings and qualification information
- AI prediction overview
- User predictions with create/edit flow
- Social login with Google and Facebook
- Fortify authentication with two-factor support
- Pest test suite

## Tech Stack

- PHP 8.5
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

- PHP 8.5 or newer
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
FOOTBALL_LEAGUE_ID=
FOOTBALL_SEASON_YEAR=2026
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

Create repeatable local demo data for competitions, teams, fixtures, standings,
statistics and AI predictions:

```bash
php artisan mondialiq:demo-data
```

Optionally add predictions for an existing human user by ID or email:

```bash
php artisan mondialiq:demo-data --user=you@example.test
```

The command only runs in local or testing environments, does not call the
football API, and does not delete existing records.

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

Sync competition data and prediction context for a server/bootstrap run:

```bash
php artisan app:sync-competition-data
```

Use the following phases for routine synchronization of all configured league-season pairs:

```bash
php artisan football:sync reference-data
php artisan football:sync fixtures
php artisan football:sync pre-match
php artisan football:sync live
php artisan football:sync post-match
php artisan football:sync standings
php artisan football:sync live --dry-run
php artisan football:api-status
```

The scheduler registers these phases with overlap protection and a shared-server
lock. Use a persistent shared cache (`database` or `redis`), including the cache
lock table for the database driver. Keep the single `schedule:run` cron documented
below; remove any separate server cron entries for the legacy football imports.
The old command names remain available for compatibility.

`config/api-football.php` reads explicit competition pairs and quota thresholds:

```dotenv
API_FOOTBALL_COMPETITIONS=39:2026,140:2026,78:2026,135:2026,61:2026,144:2026,2:2026,3:2026,848:2026
API_FOOTBALL_QUOTA_WARNING_PERCENT=25
API_FOOTBALL_QUOTA_CRITICAL_PERCENT=10
API_FOOTBALL_QUOTA_RESERVE=500
API_FOOTBALL_MINUTE_RESERVE=2
API_FOOTBALL_LIVE_SYNC_ENABLED=true
```

Seasons use their starting year: `39:2026` means Premier League 2026/27.
Use different years per league when needed. Empty competition configuration
falls back to `FOOTBALL_LEAGUE_ID` / `FOOTBALL_SEASON_YEAR`; separate league and
season lists are deliberately unsupported to prevent accidental cross products.
Malformed pairs fail explicitly. The example does not confirm subscription coverage.

At 25% remaining, low/background work pauses; at 10%, only high/critical
requests continue. At the absolute reserve, only critical live/final requests
continue. Set a smaller reserve for plans below 500 daily calls. Unknown quota
permits requests under the local minute cap until headers become available.
No Redis installation is needed: use the existing persistent Laravel cache.
The reference phase checks hourly, but successful datasets retain their own
daily/weekly/monthly refresh policy. Interrupted player pagination resumes using
cached pages. `football:api-status` reports cached observations and their age,
plus today's actual calls by endpoint/caller, without making an API request.
Cache flushes erase these temporary metrics; structured logs remain available.

`config/football_sync.php` defines request budgets and reference cache durations.
Set `FOOTBALL_SYNC_REQUESTS_PER_MINUTE` to fit the actual API plan (default 60).
If the plan does not support `/fixtures?ids`, set
`FOOTBALL_SYNC_BATCH_FIXTURES=false` through deployment configuration and rebuild
the Laravel config cache. API requests emit structured `football_api.request`
logs with endpoint, caller, status and available quota headers; cached responses
do not count as API calls. No API key or response body is logged.

For optional queued fixture processing:

```bash
php artisan football:sync post-match --queue
php artisan queue:work football --queue=football --tries=1 --timeout=3300
```

The dedicated database queue connection reserves jobs for 3360 seconds. Batch
jobs have a 3300-second upper timeout to accommodate slow fallback requests;
configure the supervisor shutdown grace period above this timeout. Dataset
retries are controlled by persistent fixture state, rather than repeated queue
attempts. The default scheduler uses synchronous batches in background commands;
queue mode groups up to 20 fixtures per unique job and retains HTTP batching.
Only change scheduler entries to `--queue` after deploying a worker.

After deploying the sync changes:

```bash
php artisan migrate --force
php artisan config:cache
php artisan queue:restart
php artisan schedule:list
```

Run migrations before restarting synchronization. No frontend changes or new
dependencies are required. This extension adds no migration; the earlier sync
state migration must already be applied. See [the multi-competition report](docs/football-multicompetition-report.md)
and [the original sync report](docs/football-sync-report.md) for the command
inventory, retry policy, limitations and recovery steps.

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
php artisan predictions:validate
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

Prediction scoring:

- Finished fixtures are detected with the fixture `status_short` values `FT`, `AET`, and `PEN`
- `php artisan predictions:validate` validates unscored user predictions for finished fixtures with a final score
- The command reuses the existing prediction scoring service and marks predictions as awarded with `points_awarded_at`
- The Laravel scheduler runs the validation command every four hours

Production scheduling requires the Laravel scheduler cron to be active:

```cron
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

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
