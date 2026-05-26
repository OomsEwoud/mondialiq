# MondialIQ Commands

Gebruik deze lijst als snelle test-cheatsheet voor lokale data-sync, prediction context en AI predictions.

Vervang `FIXTURE_ID` door een echte lokale `fixtures.id`, bijvoorbeeld `1169`.

## Prediction Context En AI

Bekijk alleen de opgeschoonde prediction context:

```bash
php artisan app:show-prediction-context FIXTURE_ID
```

Bekijk de prediction context als JSON:

```bash
php artisan app:show-prediction-context FIXTURE_ID --json
```

Bekijk de volledige AI prompt preview:

```bash
php artisan app:preview-ai-prediction-prompt FIXTURE_ID
```

Bekijk de match-context die als OpenAI `input` meegaat, zonder OpenAI-call:

```bash
php artisan app:generate-ai-prediction FIXTURE_ID --dry-run
```

Bekijk de volledige OpenAI payload-preview, inclusief vaste `instructions`:

```bash
php artisan app:generate-ai-prediction FIXTURE_ID --dry-run --show-instructions
```

Genereer een echte AI prediction via OpenAI en sla die op als `source = ai`:

```bash
php artisan app:generate-ai-prediction FIXTURE_ID
```

## Basis Data Sync

Synchroniseer alles in de bestaande volgorde:

```bash
php artisan app:sync-all-data
```

Haal landen op:

```bash
php artisan app:add-countries
```

Haal leagues op:

```bash
php artisan app:add-leagues
```

Haal teams op:

```bash
php artisan app:add-teams
```

Haal coaches op:

```bash
php artisan app:add-coaches
```

Haal spelers op:

```bash
php artisan app:add-players
```

Haal venues op:

```bash
php artisan app:add-venues
```

Haal fixtures op:

```bash
php artisan app:add-fixtures
```

## Fixture Data

Haal fixture events, lineups en statistieken op voor relevante fixtures:

```bash
php artisan app:add-fixture-data
```

Haal spelerstatistieken op voor relevante fixtures:

```bash
php artisan app:add-fixture-player-stats
```

Haal missing players/injuries op:

```bash
php artisan app:add-missing-players
```

## Odds En API Predictions

Haal bookmakers op:

```bash
php artisan app:add-bookmakers
```

Haal odds op voor relevante fixtures:

```bash
php artisan app:add-odds
```

Haal odds op inclusief recente fixtures voor development checks:

```bash
php artisan app:add-odds --include-recent
```

Haal API-FOOTBALL predictions op:

```bash
php artisan app:add-predictions
```

## Standings, Team Stats En Head-To-Head

Haal standings op:

```bash
php artisan app:add-standings
```

Importeer team statistics voor relevante teams:

```bash
php artisan app:import-team-statistics
```

Importeer team statistics voor een specifieke API-team/league/season combinatie:

```bash
php artisan app:import-team-statistics --team_id=TEAM_API_ID --league_id=LEAGUE_API_ID --season=2026
```

Forceer team statistics refresh:

```bash
php artisan app:import-team-statistics --force
```

Importeer head-to-head data voor relevante fixtures:

```bash
php artisan app:import-head-to-head
```

Importeer head-to-head data voor een specifieke fixture:

```bash
php artisan app:import-head-to-head --fixture_id=FIXTURE_ID
```

Forceer head-to-head import voor alle fixtures:

```bash
php artisan app:import-head-to-head --force
```

Forceer head-to-head import voor een specifieke fixture:

```bash
php artisan app:import-head-to-head --fixture_id=FIXTURE_ID --force
```

## Gerichte Tests

Test prediction context:

```bash
php artisan test tests/Feature/PredictionContextServiceTest.php
```

Test AI prompt builder:

```bash
php artisan test tests/Feature/AiPredictionPromptBuilderTest.php
```

Test AI prediction service:

```bash
php artisan test tests/Feature/AiPredictionServiceTest.php
```

Test AI generation command:

```bash
php artisan test tests/Feature/GenerateAiPredictionCommandTest.php
```

Test odds summary:

```bash
php artisan test tests/Feature/FixtureOddsSummaryServiceTest.php
```

Test alle backend tests:

```bash
php artisan test
```

## Handige Controlevolgorde Voor Een Fixture

1. Controleer context:

```bash
php artisan app:show-prediction-context FIXTURE_ID
```

2. Controleer OpenAI input zonder call:

```bash
php artisan app:generate-ai-prediction FIXTURE_ID --dry-run
```

3. Genereer echte AI prediction:

```bash
php artisan app:generate-ai-prediction FIXTURE_ID
```

4. Controleer opnieuw of AI prediction zichtbaar is in je app of database.
