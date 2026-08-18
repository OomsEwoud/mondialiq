<?php

namespace Database\Seeders;

use App\Enums\PredictionTypes;
use App\Models\Country;
use App\Models\Fixture;
use App\Models\FixtureEvent;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Standing;
use App\Models\Team;
use App\Models\User;
use App\Services\Fixture\LiveFixtureService;
use App\Services\Prediction\PredictionScoreService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use LogicException;

class MondialiQDemoSeeder extends Seeder
{
    private const DEMO_FIXTURE_ID_START = 9_900_000;

    /** @var array<string, League> */
    private array $leagues = [];

    /** @var array<string, Team> */
    private array $teams = [];

    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new LogicException('The MondialiQ demo seeder may only run locally or during tests.');
        }

        $this->call(AiUserSeeder::class);

        DB::transaction(function (): void {
            $countries = $this->seedCountries();
            $this->seedLeagues($countries);
            $this->seedTeams($countries);
            $this->seedDevelopmentUser();

            $fixtures = $this->seedFixtures();
            $this->seedAiPredictions($fixtures);
            $this->seedLiveEvents($fixtures->firstWhere('status_short', '2H'));
            $this->seedStandings();
        });

        app(LiveFixtureService::class)->forgetCache();
    }

    /** @return array<string, Country> */
    private function seedCountries(): array
    {
        return collect([
            'belgium' => ['name' => 'Belgium', 'fifa_code' => 'BEL'],
            'england' => ['name' => 'England', 'fifa_code' => 'ENG'],
            'spain' => ['name' => 'Spain', 'fifa_code' => 'ESP'],
            'europe' => ['name' => 'Europe', 'fifa_code' => 'EUR'],
        ])->mapWithKeys(function (array $data, string $key): array {
            $country = Country::query()->updateOrCreate(
                ['fifa_code' => $data['fifa_code']],
                ['name' => $data['name']],
            );

            return [$key => $country];
        })->all();
    }

    /** @param array<string, Country> $countries */
    private function seedLeagues(array $countries): void
    {
        $definitions = [
            'jpl' => [144, 'Jupiler Pro League', 'League', 'belgium'],
            'premier-league' => [39, 'Premier League', 'League', 'england'],
            'champions-league' => [2, 'Champions League', 'Cup', 'europe'],
            'la-liga' => [140, 'La Liga', 'League', 'spain'],
        ];

        foreach ($definitions as $key => [$externalId, $name, $type, $countryKey]) {
            $this->leagues[$key] = League::query()->updateOrCreate(
                ['external_id' => $externalId],
                [
                    'name' => $name,
                    'type' => $type,
                    'country_id' => $countries[$countryKey]->id,
                    'logo_url' => "https://media.api-sports.io/football/leagues/{$externalId}.png",
                ],
            );
        }
    }

    /** @param array<string, Country> $countries */
    private function seedTeams(array $countries): void
    {
        $definitions = [
            'club-brugge' => [569, 'Club Brugge', 'BRU', 'belgium', 1891],
            'anderlecht' => [554, 'Anderlecht', 'AND', 'belgium', 1908],
            'genk' => [742, 'Genk', 'GNK', 'belgium', 1988],
            'union-sg' => [1393, 'Union SG', 'USG', 'belgium', 1897],
            'antwerp' => [740, 'Antwerp', 'ANT', 'belgium', 1880],
            'gent' => [631, 'Gent', 'GNT', 'belgium', 1900],
            'arsenal' => [42, 'Arsenal', 'ARS', 'england', 1886],
            'liverpool' => [40, 'Liverpool', 'LIV', 'england', 1892],
            'manchester-city' => [50, 'Manchester City', 'MCI', 'england', 1880],
            'chelsea' => [49, 'Chelsea', 'CHE', 'england', 1905],
            'manchester-united' => [33, 'Manchester United', 'MUN', 'england', 1878],
            'tottenham' => [47, 'Tottenham', 'TOT', 'england', 1882],
            'real-madrid' => [541, 'Real Madrid', 'RMA', 'spain', 1902],
            'barcelona' => [529, 'Barcelona', 'BAR', 'spain', 1899],
            'atletico-madrid' => [530, 'Atlético Madrid', 'ATM', 'spain', 1903],
            'athletic-club' => [531, 'Athletic Club', 'ATH', 'spain', 1898],
        ];

        foreach ($definitions as $key => [$externalId, $name, $code, $countryKey, $foundedAt]) {
            $this->teams[$key] = Team::query()->updateOrCreate(
                ['external_id' => $externalId],
                [
                    'name' => $name,
                    'code' => $code,
                    'country_id' => $countries[$countryKey]->id,
                    'founded_at' => $foundedAt,
                    'logo_url' => "https://media.api-sports.io/football/teams/{$externalId}.png",
                ],
            );
        }
    }

    private function seedDevelopmentUser(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'ewoud@mondialiq.local'],
            [
                'name' => 'Ewoud',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_system_user' => false,
            ],
        );
    }

    /** @return Collection<int, Fixture> */
    private function seedFixtures(): Collection
    {
        $now = CarbonImmutable::now('Europe/Brussels');
        $definitions = $this->todayFixtures($now)
            ->concat($this->tomorrowFixtures($now))
            ->concat($this->weekFixtures($now))
            ->concat($this->pastFixtures($now))
            ->values();

        return $definitions->map(function (array $definition, int $index): Fixture {
            [$home, $away] = $definition['teams'];

            return Fixture::query()->updateOrCreate(
                ['external_id' => self::DEMO_FIXTURE_ID_START + $index],
                [
                    'league_id' => $this->leagues[$definition['league']]->id,
                    'home_team_id' => $this->teams[$home]->id,
                    'away_team_id' => $this->teams[$away]->id,
                    'round_name' => $definition['round'],
                    'season' => $this->season(),
                    'match_date' => $definition['date'],
                    'status_short' => $definition['status_short'],
                    'status_long' => $definition['status_long'],
                    'elapsed_time' => $definition['elapsed_time'] ?? null,
                    'halftime_home_goals' => $definition['halftime'][0] ?? null,
                    'halftime_away_goals' => $definition['halftime'][1] ?? null,
                    'fulltime_home_goals' => $definition['score'][0] ?? null,
                    'fulltime_away_goals' => $definition['score'][1] ?? null,
                    'result' => $this->result($definition['score'] ?? null),
                ],
            );
        });
    }

    private function todayFixtures(CarbonImmutable $now): Collection
    {
        return collect([
            $this->fixture('jpl', 'club-brugge', 'anderlecht', $now->subHours(5), 'FT', 'Match Finished', [2, 1], [1, 0]),
            $this->fixture('jpl', 'genk', 'union-sg', $now->subHours(3), 'FT', 'Match Finished', [1, 1], [0, 1]),
            $this->fixture('premier-league', 'arsenal', 'liverpool', $now->subMinutes(63), '2H', 'Second Half', [1, 1], [1, 0], 63),
            $this->fixture('jpl', 'antwerp', 'gent', $now->addMinutes(45)),
            $this->fixture('la-liga', 'barcelona', 'atletico-madrid', $now->addMinutes(90)),
            $this->fixture('premier-league', 'manchester-city', 'chelsea', $now->addMinutes(135)),
            $this->fixture('la-liga', 'real-madrid', 'athletic-club', $now->addMinutes(180)),
        ]);
    }

    private function tomorrowFixtures(CarbonImmutable $now): Collection
    {
        $tomorrow = $now->addDay()->startOfDay();
        $matches = [
            ['jpl', 'anderlecht', 'genk'],
            ['jpl', 'union-sg', 'antwerp'],
            ['premier-league', 'liverpool', 'manchester-city'],
            ['premier-league', 'chelsea', 'tottenham'],
            ['premier-league', 'manchester-united', 'arsenal'],
            ['la-liga', 'athletic-club', 'barcelona'],
            ['la-liga', 'atletico-madrid', 'real-madrid'],
            ['champions-league', 'club-brugge', 'liverpool'],
        ];

        return collect($matches)->map(fn (array $match, int $index): array => $this->fixture(
            $match[0],
            $match[1],
            $match[2],
            $tomorrow->setTime(13 + intdiv($index, 2), ($index % 2) * 30),
            round: 'Matchday 2',
        ));
    }

    private function weekFixtures(CarbonImmutable $now): Collection
    {
        $matches = [
            ['champions-league', 'real-madrid', 'arsenal'],
            ['jpl', 'gent', 'club-brugge'],
            ['premier-league', 'tottenham', 'manchester-united'],
            ['la-liga', 'barcelona', 'real-madrid'],
            ['champions-league', 'manchester-city', 'atletico-madrid'],
            ['jpl', 'genk', 'antwerp'],
            ['premier-league', 'arsenal', 'chelsea'],
            ['la-liga', 'athletic-club', 'atletico-madrid'],
            ['champions-league', 'liverpool', 'barcelona'],
            ['jpl', 'anderlecht', 'union-sg'],
            ['premier-league', 'manchester-city', 'tottenham'],
            ['champions-league', 'club-brugge', 'real-madrid'],
        ];

        return collect($matches)->map(fn (array $match, int $index): array => $this->fixture(
            $match[0],
            $match[1],
            $match[2],
            $now->addDays(2 + ($index % 6))->startOfDay()->setTime(18 + ($index % 3), ($index % 2) * 30),
            round: 'Matchday '.(3 + intdiv($index, 4)),
        ));
    }

    private function pastFixtures(CarbonImmutable $now): Collection
    {
        $matches = [
            ['jpl', 'anderlecht', 'club-brugge'],
            ['premier-league', 'liverpool', 'arsenal'],
            ['la-liga', 'atletico-madrid', 'barcelona'],
            ['premier-league', 'chelsea', 'manchester-city'],
            ['jpl', 'union-sg', 'genk'],
            ['la-liga', 'athletic-club', 'real-madrid'],
            ['champions-league', 'arsenal', 'club-brugge'],
            ['jpl', 'gent', 'antwerp'],
            ['premier-league', 'manchester-united', 'liverpool'],
            ['la-liga', 'real-madrid', 'atletico-madrid'],
            ['champions-league', 'barcelona', 'manchester-city'],
            ['jpl', 'club-brugge', 'genk'],
            ['premier-league', 'tottenham', 'chelsea'],
            ['la-liga', 'barcelona', 'athletic-club'],
            ['champions-league', 'liverpool', 'real-madrid'],
            ['jpl', 'antwerp', 'anderlecht'],
            ['premier-league', 'arsenal', 'manchester-united'],
            ['champions-league', 'manchester-city', 'union-sg'],
        ];
        $scores = [[2, 1], [3, 1], [0, 0], [0, 2], [1, 1], [0, 3], [2, 0], [1, 2], [2, 2], [4, 1], [1, 1], [3, 0], [2, 1], [2, 2], [0, 1], [1, 0], [3, 2], [4, 0]];

        return collect($matches)->map(fn (array $match, int $index): array => $this->fixture(
            $match[0],
            $match[1],
            $match[2],
            $now->subDays(1 + ($index % 14))->startOfDay()->setTime(18 + ($index % 3), ($index % 2) * 30),
            'FT',
            'Match Finished',
            $scores[$index],
            [min(2, $scores[$index][0]), min(1, $scores[$index][1])],
            round: 'Matchday '.max(1, 8 - intdiv($index, 3)),
        ));
    }

    private function fixture(
        string $league,
        string $home,
        string $away,
        CarbonImmutable $date,
        string $statusShort = 'NS',
        string $statusLong = 'Not Started',
        ?array $score = null,
        ?array $halftime = null,
        ?int $elapsedTime = null,
        string $round = 'Matchday 1',
    ): array {
        return compact('league', 'date', 'score', 'halftime', 'elapsedTime') + [
            'teams' => [$home, $away],
            'status_short' => $statusShort,
            'status_long' => $statusLong,
            'round' => $round,
            'elapsed_time' => $elapsedTime,
        ];
    }

    /** @param Collection<int, Fixture> $fixtures */
    private function seedAiPredictions(Collection $fixtures): void
    {
        $aiUser = User::aiUser();

        if ($aiUser === null) {
            throw new LogicException('The AI system user could not be created.');
        }

        $confidenceLevels = [48, 53, 58, 64, 69, 72, 77, 81, 86];
        $fixtures->each(function (Fixture $fixture, int $index) use ($aiUser, $confidenceLevels): void {
            [$homeGoals, $awayGoals] = $this->predictionScore($fixture, $index);
            [$homeChance, $drawChance, $awayChance] = $this->probabilities($homeGoals, $awayGoals, $index);
            $winnerId = match (true) {
                $homeGoals > $awayGoals => $fixture->home_team_id,
                $awayGoals > $homeGoals => $fixture->away_team_id,
                default => null,
            };
            $isFinished = $fixture->status_short === 'FT';
            $points = $isFinished
                ? app(PredictionScoreService::class)->calculate(
                    $homeGoals,
                    $awayGoals,
                    $fixture->fulltime_home_goals,
                    $fixture->fulltime_away_goals,
                )
                : 0;

            Prediction::query()->updateOrCreate(
                ['user_id' => $aiUser->id, 'fixture_id' => $fixture->id],
                [
                    'winner_id' => $winnerId,
                    'source' => PredictionTypes::Ai,
                    'visibility' => 'public',
                    'total_goals' => $homeGoals + $awayGoals,
                    'home_goals' => $homeGoals,
                    'away_goals' => $awayGoals,
                    'confidence' => (string) $confidenceLevels[$index % count($confidenceLevels)],
                    'advice' => $this->aiAdvice($fixture, $homeChance, $drawChance, $awayChance),
                    'home_chance' => $homeChance,
                    'draw_chance' => $drawChance,
                    'away_chance' => $awayChance,
                    'points' => $points,
                    'points_awarded_at' => $isFinished ? $fixture->match_date->addHours(2) : null,
                ],
            );
        });
    }

    /** @return array{int, int} */
    private function predictionScore(Fixture $fixture, int $index): array
    {
        if ($fixture->status_short !== 'FT') {
            return [[2, 1], [1, 1], [2, 1], [1, 0], [2, 1], [2, 0], [3, 1]][$index % 7];
        }

        $actual = [$fixture->fulltime_home_goals, $fixture->fulltime_away_goals];

        return match ($index % 4) {
            0 => $actual,
            1 => $actual[0] === $actual[1]
                ? [1, 1]
                : ($actual[0] > $actual[1] ? [$actual[0] + 1, $actual[1]] : [$actual[0], $actual[1] + 1]),
            2 => $actual[0] > $actual[1] ? [$actual[0] + 1, $actual[1]] : [$actual[0], $actual[1] + 1],
            default => $actual[0] >= $actual[1] ? [0, 2] : [2, 0],
        };
    }

    /** @return array{int, int, int} */
    private function probabilities(int $homeGoals, int $awayGoals, int $index): array
    {
        $variation = $index % 8;

        return match (true) {
            $homeGoals > $awayGoals => [52 + $variation, 26 - intdiv($variation, 2), 22 - (intdiv($variation + 1, 2))],
            $awayGoals > $homeGoals => [22 - intdiv($variation + 1, 2), 26 - intdiv($variation, 2), 52 + $variation],
            default => [31 + intdiv($variation, 2), 40 - $variation, 29 + intdiv($variation + 1, 2)],
        };
    }

    private function aiAdvice(
        Fixture $fixture,
        int $homeChance,
        int $drawChance,
        int $awayChance,
    ): string {
        $highest = max($homeChance, $drawChance, $awayChance);

        if ($highest === $homeChance) {
            return "{$fixture->homeTeam->name} krijgt het voordeel door de combinatie van recente vorm en thuisprestaties.";
        }

        if ($highest === $awayChance) {
            return "{$fixture->awayTeam->name} heeft volgens het model de beste papieren, vooral door de efficiënte aanval.";
        }

        return 'De kansen liggen dicht bij elkaar; MondialiQ verwacht weinig verschil tussen beide teams.';
    }

    private function seedLiveEvents(?Fixture $fixture): void
    {
        if ($fixture === null) {
            return;
        }

        $events = [
            [$fixture->home_team_id, $fixture->homeTeam->name, 22, 'Goal', 'Normal Goal', 'Sterke afwerking na een snelle aanval.'],
            [$fixture->away_team_id, $fixture->awayTeam->name, 51, 'Goal', 'Normal Goal', 'Gelijkmaker kort na de rust.'],
            [$fixture->home_team_id, $fixture->homeTeam->name, 58, 'Card', 'Yellow Card', 'Late tackle op het middenveld.'],
        ];

        foreach ($events as [$teamId, $teamName, $minute, $type, $detail, $comments]) {
            $eventKey = FixtureEvent::buildEventKey($fixture->id, $minute, null, $teamId, $type, $detail);

            FixtureEvent::query()->updateOrCreate(
                ['fixture_id' => $fixture->id, 'event_key' => $eventKey],
                [
                    'team_id' => $teamId,
                    'team_name' => $teamName,
                    'time_elapsed' => $minute,
                    'type' => $type,
                    'detail' => $detail,
                    'comments' => $comments,
                ],
            );
        }
    }

    private function seedStandings(): void
    {
        foreach (['jpl', 'premier-league', 'la-liga'] as $leagueKey) {
            $league = $this->leagues[$leagueKey];
            $leagueTeams = collect($this->teams)
                ->filter(fn (Team $team): bool => match ($leagueKey) {
                    'jpl' => $team->country_id === $this->teams['club-brugge']->country_id,
                    'premier-league' => $team->country_id === $this->teams['arsenal']->country_id,
                    default => $team->country_id === $this->teams['real-madrid']->country_id,
                })
                ->values();

            $leagueTeams->each(function (Team $team, int $index) use ($league): void {
                $matchesPlayed = 5;
                $wins = max(1, 4 - intdiv($index, 2));
                $draws = min(2, $index % 3);
                $losses = $matchesPlayed - $wins - $draws;
                $goalsFor = 12 - $index;
                $goalsAgainst = 4 + $index;

                Standing::query()->updateOrCreate(
                    [
                        'league_id' => $league->id,
                        'season' => $this->season(),
                        'group_name' => 'Regular Season',
                        'team_id' => $team->id,
                    ],
                    [
                        'rank' => $index + 1,
                        'points' => ($wins * 3) + $draws,
                        'matches_played' => $matchesPlayed,
                        'wins' => $wins,
                        'draws' => $draws,
                        'losses' => $losses,
                        'goals_for' => $goalsFor,
                        'goals_against' => $goalsAgainst,
                        'goal_difference' => $goalsFor - $goalsAgainst,
                        'form' => ['WWDWW', 'WDWLW', 'DWWDL', 'LWDLW'][$index % 4],
                        'goals_scored_last_5' => $goalsFor,
                        'goals_conceded_last_5' => $goalsAgainst,
                    ],
                );
            });
        }
    }

    /** @param array{int, int}|null $score */
    private function result(?array $score): ?string
    {
        if ($score === null) {
            return null;
        }

        return match (true) {
            $score[0] > $score[1] => 'H',
            $score[1] > $score[0] => 'A',
            default => 'D',
        };
    }

    private function season(): int
    {
        return (int) config('services.api_football.season');
    }
}
