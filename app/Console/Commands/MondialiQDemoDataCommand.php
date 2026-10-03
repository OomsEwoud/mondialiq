<?php

namespace App\Console\Commands;

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\FixtureStat;
use App\Models\League;
use App\Models\Player;
use App\Models\PlayerSeasonStat;
use App\Models\Prediction;
use App\Models\Standing;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Models\User;
use Database\Seeders\MondialiQDemoSeeder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use LogicException;

#[Signature('mondialiq:demo-data {--user= : Add demo predictions to an existing human user by ID or email}')]
#[Description('Populate local football competitions with repeatable demo data')]
class MondialiQDemoDataCommand extends Command
{
    public function handle(): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->error('Demo data can only be generated in local or testing environments.');

            return self::FAILURE;
        }

        $userOption = $this->option('user');
        $userIdentifier = is_string($userOption) ? trim($userOption) : '';
        $user = $userIdentifier === '' ? null : $this->resolveUser($userIdentifier);

        if ($userIdentifier !== '' && $user === null) {
            $this->error('The selected human user could not be found. Use an existing user ID or email.');

            return self::FAILURE;
        }

        $this->info('Creating development demo data...');

        try {
            $seeder = app(MondialiQDemoSeeder::class)
                ->setContainer(app())
                ->setCommand($this);
            $seeder->__invoke(['userId' => $user?->id]);
        } catch (LogicException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $leagueIds = League::query()
            ->whereBetween('external_id', [
                MondialiQDemoSeeder::DEMO_LEAGUE_ID_START,
                MondialiQDemoSeeder::DEMO_LEAGUE_ID_START + 999,
            ])
            ->pluck('id');
        $fixtureIds = Fixture::query()
            ->whereBetween('external_id', [
                MondialiQDemoSeeder::DEMO_FIXTURE_ID_START,
                MondialiQDemoSeeder::DEMO_FIXTURE_ID_END,
            ])
            ->pluck('id');

        $this->table(['Gegeven', 'Aantal'], [
            ['Competities', League::query()->whereIn('id', $leagueIds)->count()],
            ['Teams', Team::query()->whereBetween('external_id', [
                MondialiQDemoSeeder::DEMO_TEAM_ID_START,
                MondialiQDemoSeeder::DEMO_TEAM_ID_START + 999,
            ])->count()],
            ['Spelers', Player::query()->whereBetween('external_id', [
                MondialiQDemoSeeder::DEMO_PLAYER_ID_START,
                MondialiQDemoSeeder::DEMO_PLAYER_ID_START + 999,
            ])->count()],
            ['Wedstrijden', $fixtureIds->count()],
            ['Live wedstrijden', Fixture::query()->whereIn('id', $fixtureIds)->where('status_short', '2H')->count()],
            ['Aankomende wedstrijden', Fixture::query()
                ->whereIn('id', $fixtureIds)
                ->where('status_short', 'NS')
                ->where('match_date', '>', now(MondialiQDemoSeeder::DEMO_TIMEZONE))
                ->count()],
            ['Afgeronde wedstrijden', Fixture::query()->whereIn('id', $fixtureIds)->where('status_short', 'FT')->count()],
            ['AI-analyses', Prediction::query()
                ->whereIn('fixture_id', $fixtureIds)
                ->where('source', PredictionTypes::Ai)
                ->count()],
            ['Standregels', Standing::query()->whereIn('league_id', $leagueIds)->count()],
            ['Teamstatistieken', TeamStatistic::query()->whereIn('league_id', $leagueIds)->count()],
            ['Spelerstatistieken', PlayerSeasonStat::query()->whereIn('league_id', $leagueIds)->count()],
            ['Wedstrijdstatistieken', FixtureStat::query()->whereIn('fixture_id', $fixtureIds)->count()],
            ['Gebruikersvoorspellingen', $user === null
                ? 0
                : Prediction::query()
                    ->whereBelongsTo($user)
                    ->whereIn('fixture_id', $fixtureIds)
                    ->where('source', PredictionTypes::User)
                    ->count()],
        ]);

        $this->info('Demo data created successfully.');

        return self::SUCCESS;
    }

    private function resolveUser(string $identifier): ?User
    {
        $query = User::query()->where('is_system_user', false);

        if (filter_var($identifier, FILTER_VALIDATE_INT) !== false) {
            $query->whereKey((int) $identifier);
        } else {
            $query->where('email', $identifier);
        }

        return $query->first();
    }
}
