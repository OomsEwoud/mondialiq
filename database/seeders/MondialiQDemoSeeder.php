<?php

namespace Database\Seeders;

use App\Enums\PredictionTypes;
use App\Models\Coach;
use App\Models\Country;
use App\Models\Fixture;
use App\Models\FixtureEvent;
use App\Models\FixtureStat;
use App\Models\League;
use App\Models\Player;
use App\Models\PlayerSeasonStat;
use App\Models\Prediction;
use App\Models\Standing;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Models\User;
use App\Services\Fixture\LiveFixtureService;
use App\Services\Prediction\PredictionScoreService;
use App\Support\Competition\CompetitionContext;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use LogicException;

class MondialiQDemoSeeder extends Seeder
{
    public const DEMO_FIXTURE_ID_START = 99_000_000;

    public const DEMO_FIXTURE_ID_END = self::DEMO_FIXTURE_ID_START + 999;

    public const DEMO_LEAGUE_ID_START = 99_100_000;

    public const DEMO_TEAM_ID_START = 99_200_000;

    public const DEMO_PLAYER_ID_START = 99_300_000;

    public const DEMO_TIMEZONE = 'Europe/Brussels';

    /** @var array<string, list<string>> */
    private const DOMESTIC_LEAGUE_TEAMS = [
        'jpl' => ['club-brugge', 'anderlecht', 'genk', 'union-sg', 'antwerp', 'gent'],
        'premier-league' => ['arsenal', 'liverpool', 'manchester-city', 'chelsea', 'manchester-united', 'tottenham'],
        'la-liga' => ['real-madrid', 'barcelona', 'atletico-madrid', 'athletic-club'],
    ];

    /** @var array<string, League> */
    private array $leagues = [];

    /** @var array<string, Team> */
    private array $teams = [];

    public function run(?int $userId = null): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new LogicException('The MondialiQ demo seeder may only run locally or during tests.');
        }

        $this->call(AiUserSeeder::class);

        DB::transaction(function () use ($userId): void {
            $countries = $this->seedCountries();
            $this->seedLeagues($countries);
            $this->seedTeams($countries);
            $this->seedCoaches($countries);

            $fixtures = $this->seedFixtures();
            $this->seedAiPredictions($fixtures);
            $this->seedLiveEvents($fixtures->firstWhere('status_short', '2H'));
            $this->seedStandings();
            $this->seedTeamStatistics();
            $this->seedPlayers();
            $this->seedFixtureStatistics($fixtures);

            if ($userId !== null) {
                $this->seedUserPredictions($userId, $fixtures);
            }
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
            'jpl' => [self::DEMO_LEAGUE_ID_START + 1, 'Jupiler Pro League (Demo)', 'League', 'belgium'],
            'premier-league' => [self::DEMO_LEAGUE_ID_START + 2, 'Premier League (Demo)', 'League', 'england'],
            'champions-league' => [self::DEMO_LEAGUE_ID_START + 3, 'Champions League (Demo)', 'Cup', 'europe'],
            'la-liga' => [self::DEMO_LEAGUE_ID_START + 4, 'La Liga (Demo)', 'League', 'spain'],
        ];

        foreach ($definitions as $key => [$externalId, $name, $type, $countryKey]) {
            $this->leagues[$key] = League::query()->updateOrCreate(
                ['external_id' => $externalId],
                [
                    'name' => $name,
                    'type' => $type,
                    'country_id' => $countries[$countryKey]->id,
                    'logo_url' => null,
                ],
            );
        }
    }

    /** @param array<string, Country> $countries */
    private function seedTeams(array $countries): void
    {
        $definitions = [
            'club-brugge' => [self::DEMO_TEAM_ID_START + 1, 'Club Brugge', 'BRU', 'belgium', 1891],
            'anderlecht' => [self::DEMO_TEAM_ID_START + 2, 'Anderlecht', 'AND', 'belgium', 1908],
            'genk' => [self::DEMO_TEAM_ID_START + 3, 'Genk', 'GNK', 'belgium', 1988],
            'union-sg' => [self::DEMO_TEAM_ID_START + 4, 'Union SG', 'USG', 'belgium', 1897],
            'antwerp' => [self::DEMO_TEAM_ID_START + 5, 'Antwerp', 'ANT', 'belgium', 1880],
            'gent' => [self::DEMO_TEAM_ID_START + 6, 'Gent', 'GNT', 'belgium', 1900],
            'arsenal' => [self::DEMO_TEAM_ID_START + 7, 'Arsenal', 'ARS', 'england', 1886],
            'liverpool' => [self::DEMO_TEAM_ID_START + 8, 'Liverpool', 'LIV', 'england', 1892],
            'manchester-city' => [self::DEMO_TEAM_ID_START + 9, 'Manchester City', 'MCI', 'england', 1880],
            'chelsea' => [self::DEMO_TEAM_ID_START + 10, 'Chelsea', 'CHE', 'england', 1905],
            'manchester-united' => [self::DEMO_TEAM_ID_START + 11, 'Manchester United', 'MUN', 'england', 1878],
            'tottenham' => [self::DEMO_TEAM_ID_START + 12, 'Tottenham', 'TOT', 'england', 1882],
            'real-madrid' => [self::DEMO_TEAM_ID_START + 13, 'Real Madrid', 'RMA', 'spain', 1902],
            'barcelona' => [self::DEMO_TEAM_ID_START + 14, 'Barcelona', 'BAR', 'spain', 1899],
            'atletico-madrid' => [self::DEMO_TEAM_ID_START + 15, 'Atlético Madrid', 'ATM', 'spain', 1903],
            'athletic-club' => [self::DEMO_TEAM_ID_START + 16, 'Athletic Club', 'ATH', 'spain', 1898],
        ];

        foreach ($definitions as $key => [$externalId, $name, $code, $countryKey, $foundedAt]) {
            $this->teams[$key] = Team::query()->updateOrCreate(
                ['external_id' => $externalId],
                [
                    'name' => $name,
                    'code' => $code,
                    'country_id' => $countries[$countryKey]->id,
                    'founded_at' => $foundedAt,
                    'logo_url' => '',
                ],
            );
        }
    }

    /** @param array<string, Country> $countries */
    private function seedCoaches(array $countries): void
    {
        $definitions = [
            'club-brugge' => ['Thomas', 'Vermeer', 'belgium'],
            'arsenal' => ['Daniel', 'Mercer', 'england'],
            'barcelona' => ['Javier', 'Ortega', 'spain'],
            'real-madrid' => ['Mateo', 'Serrano', 'spain'],
        ];

        foreach ($definitions as $teamKey => [$firstName, $lastName, $countryKey]) {
            $team = $this->teams[$teamKey];

            Coach::query()->updateOrCreate(
                ['team_id' => $team->id],
                [
                    'external_id' => null,
                    'country_id' => $countries[$countryKey]->id,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'display_name' => "{$firstName} {$lastName}",
                    'birth_date' => null,
                    'photo_url' => null,
                ],
            );
        }
    }

    /** @return Collection<int, Fixture> */
    private function seedFixtures(): Collection
    {
        $now = CarbonImmutable::now(self::DEMO_TIMEZONE);
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
            return [[2, 1], [1, 1], [0, 1], [1, 0], [2, 1], [0, 2], [3, 1]][$index % 7];
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
        foreach (array_keys(self::DOMESTIC_LEAGUE_TEAMS) as $leagueKey) {
            $league = $this->leagues[$leagueKey];
            $leagueTeams = collect(self::DOMESTIC_LEAGUE_TEAMS[$leagueKey])
                ->map(fn (string $teamKey): Team => $this->teams[$teamKey]);
            $records = [
                [4, 1, 0],
                [4, 0, 1],
                [3, 2, 0],
                [2, 3, 0],
                [2, 2, 1],
                [2, 1, 2],
            ];
            $forms = ['WWDWW', 'WWLWW', 'WDWDD', 'WDWDD', 'WDLWD', 'WDLWL'];

            $leagueTeams->each(function (Team $team, int $index) use ($league, $records, $forms): void {
                $matchesPlayed = 5;
                [$wins, $draws, $losses] = $records[$index];
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
                        'form' => $forms[$index],
                        'goals_scored_last_5' => $goalsFor,
                        'goals_conceded_last_5' => $goalsAgainst,
                    ],
                );
            });
        }
    }

    private function seedTeamStatistics(): void
    {
        foreach (self::DOMESTIC_LEAGUE_TEAMS as $leagueKey => $teamKeys) {
            $league = $this->leagues[$leagueKey];

            foreach ($teamKeys as $teamKey) {
                $team = $this->teams[$teamKey];
                $standing = Standing::query()
                    ->whereBelongsTo($league)
                    ->whereBelongsTo($team)
                    ->where('season', $this->season())
                    ->firstOrFail();
                $homePlayed = 3;
                $awayPlayed = $standing->matches_played - $homePlayed;
                $homeWins = min(2, $standing->wins);
                $awayWins = $standing->wins - $homeWins;
                $homeDraws = min(1, $standing->draws);
                $awayDraws = $standing->draws - $homeDraws;
                $homeGoalsFor = intdiv($standing->goals_for + 1, 2);
                $homeGoalsAgainst = intdiv($standing->goals_against + 1, 2);

                TeamStatistic::query()->updateOrCreate(
                    [
                        'statistics_key' => "{$team->external_id}-{$league->external_id}-{$this->season()}-demo",
                    ],
                    [
                        'team_id' => $team->id,
                        'league_id' => $league->id,
                        'api_team_id' => $team->external_id,
                        'api_league_id' => $league->external_id,
                        'season' => $this->season(),
                        'statistics_date' => now(self::DEMO_TIMEZONE)->toDateString(),
                        'form' => $standing->form,
                        'fixtures_played_home' => $homePlayed,
                        'fixtures_played_away' => $awayPlayed,
                        'fixtures_played_total' => $standing->matches_played,
                        'wins_home' => $homeWins,
                        'wins_away' => $awayWins,
                        'wins_total' => $standing->wins,
                        'draws_home' => $homeDraws,
                        'draws_away' => $awayDraws,
                        'draws_total' => $standing->draws,
                        'losses_home' => $homePlayed - $homeWins - $homeDraws,
                        'losses_away' => $awayPlayed - $awayWins - $awayDraws,
                        'losses_total' => $standing->losses,
                        'goals_for_home' => $homeGoalsFor,
                        'goals_for_away' => $standing->goals_for - $homeGoalsFor,
                        'goals_for_total' => $standing->goals_for,
                        'goals_for_avg_home' => round($homeGoalsFor / $homePlayed, 2),
                        'goals_for_avg_away' => round(($standing->goals_for - $homeGoalsFor) / $awayPlayed, 2),
                        'goals_for_avg_total' => round($standing->goals_for / $standing->matches_played, 2),
                        'goals_against_home' => $homeGoalsAgainst,
                        'goals_against_away' => $standing->goals_against - $homeGoalsAgainst,
                        'goals_against_total' => $standing->goals_against,
                        'goals_against_avg_home' => round($homeGoalsAgainst / $homePlayed, 2),
                        'goals_against_avg_away' => round(($standing->goals_against - $homeGoalsAgainst) / $awayPlayed, 2),
                        'goals_against_avg_total' => round($standing->goals_against / $standing->matches_played, 2),
                        'clean_sheets_home' => min($homeWins, intdiv($standing->matches_played, 2)),
                        'clean_sheets_away' => min($awayWins, intdiv($standing->matches_played, 2)),
                        'clean_sheets_total' => min($standing->wins, intdiv($standing->matches_played, 2)),
                        'biggest_wins_streak' => min(3, $standing->wins),
                        'biggest_draws_streak' => min(2, $standing->draws),
                        'biggest_losses_streak' => min(2, $standing->losses),
                        'most_used_formation' => '4-3-3',
                        'fetched_at' => now(self::DEMO_TIMEZONE),
                    ],
                );
            }
        }
    }

    private function seedPlayers(): void
    {
        $firstNames = ['Alex', 'Milan', 'Noah', 'Luca', 'Sem', 'Mats', 'Ruben', 'Adam'];
        $lastNames = ['Vermeer', 'Peeters', 'Silva', 'Costa', 'Jansen', 'De Smet', 'Bakker', 'Garcia'];
        $playerIndex = 0;

        foreach (self::DOMESTIC_LEAGUE_TEAMS as $leagueKey => $teamKeys) {
            $league = $this->leagues[$leagueKey];

            foreach ($teamKeys as $teamKey) {
                $team = $this->teams[$teamKey];

                foreach (['Forward', 'Midfielder'] as $positionIndex => $role) {
                    $firstName = $firstNames[$playerIndex % count($firstNames)];
                    $lastName = $lastNames[intdiv($playerIndex, 2) % count($lastNames)];
                    $displayName = "{$firstName} {$lastName}";
                    $player = Player::query()->updateOrCreate(
                        ['external_id' => self::DEMO_PLAYER_ID_START + $playerIndex],
                        [
                            'country_id' => $team->country_id,
                            'first_name' => $firstName,
                            'last_name' => $lastName,
                            'display_name' => $displayName,
                            'position' => $role,
                            'number' => $positionIndex === 0 ? 9 : 10,
                        ],
                    );

                    $team->players()->syncWithoutDetaching([
                        $player->id => ['is_active' => true],
                    ]);

                    $goals = $positionIndex === 0
                        ? 4 + ($playerIndex % 6)
                        : 1 + ($playerIndex % 3);
                    $assists = $positionIndex === 0
                        ? 1 + ($playerIndex % 4)
                        : 2 + ($playerIndex % 5);

                    foreach ([1, 2] as $seasonsAgo) {
                        $appearances = 28 + ($playerIndex % 5) - $seasonsAgo;
                        $seasonGoals = $goals * (4 - $seasonsAgo);
                        $seasonAssists = $assists * (4 - $seasonsAgo);

                        PlayerSeasonStat::query()->updateOrCreate(
                            [
                                'player_id' => $player->id,
                                'league_id' => $league->id,
                                'season' => $this->season() - $seasonsAgo,
                            ],
                            [
                                'appearances' => $appearances,
                                'total_minutes' => $appearances * (80 - $seasonsAgo * 5),
                                'position' => $role,
                                'rating' => 6.6 + (($playerIndex % 10) / 10) - $seasonsAgo / 10,
                                'total_shots' => $seasonGoals * 4,
                                'shots_on_target' => $seasonGoals * 2,
                                'total_goals' => $seasonGoals,
                                'total_assists' => $seasonAssists,
                                'total_passes' => $appearances * ($positionIndex === 0 ? 19 : 52),
                                'key_passes' => $seasonAssists * 3,
                                'pass_accuracy' => ($positionIndex === 0 ? 76.5 : 88.2) - $seasonsAgo,
                            ],
                        );
                    }

                    PlayerSeasonStat::query()->updateOrCreate(
                        [
                            'player_id' => $player->id,
                            'league_id' => $league->id,
                            'season' => $this->season(),
                        ],
                        [
                            'appearances' => 5,
                            'total_minutes' => 450,
                            'position' => $role,
                            'rating' => 6.8 + (($playerIndex % 12) / 10),
                            'total_shots' => $goals * 3,
                            'shots_on_target' => $goals * 2,
                            'total_goals' => $goals,
                            'total_assists' => $assists,
                            'total_passes' => $positionIndex === 0 ? 95 : 260,
                            'key_passes' => $assists * 2,
                            'pass_accuracy' => $positionIndex === 0 ? 76.5 : 88.2,
                        ],
                    );

                    $playerIndex++;
                }
            }
        }
    }

    /** @param Collection<int, Fixture> $fixtures */
    private function seedFixtureStatistics(Collection $fixtures): void
    {
        $fixtures
            ->filter(fn (Fixture $fixture): bool => in_array($fixture->status_short, ['FT', '2H'], true))
            ->values()
            ->each(function (Fixture $fixture, int $index): void {
                $homePossession = 48 + ($index % 9);
                $homeShots = 10 + ($index % 8);
                $awayShots = 7 + (($index + 3) % 7);
                $stats = [
                    ['Ball Possession', $homePossession, 100 - $homePossession],
                    ['Total Shots', $homeShots, $awayShots],
                    ['Shots on Goal', max(1, intdiv($homeShots, 2)), max(1, intdiv($awayShots, 2))],
                    ['Corner Kicks', 3 + ($index % 7), 2 + (($index + 2) % 6)],
                ];

                foreach ($stats as [$name, $homeValue, $awayValue]) {
                    FixtureStat::query()->updateOrCreate(
                        ['fixture_id' => $fixture->id, 'team_id' => $fixture->home_team_id, 'name' => $name],
                        ['value' => $homeValue],
                    );
                    FixtureStat::query()->updateOrCreate(
                        ['fixture_id' => $fixture->id, 'team_id' => $fixture->away_team_id, 'name' => $name],
                        ['value' => $awayValue],
                    );
                }
            });
    }

    /** @param Collection<int, Fixture> $fixtures */
    private function seedUserPredictions(int $userId, Collection $fixtures): void
    {
        $scores = [[2, 0], [1, 1], [0, 1], [3, 1], [1, 2], [2, 2]];
        $confidenceLevels = [82, 67, 53, 76, 61, 49];
        $index = 0;

        $fixtures
            ->filter(fn (Fixture $fixture): bool => $fixture->status_short === 'NS' && ! $fixture->hasStarted())
            ->take(count($scores))
            ->each(function (Fixture $fixture) use ($userId, $scores, $confidenceLevels, &$index): void {
                [$homeGoals, $awayGoals] = $scores[$index];
                $winnerId = match (true) {
                    $homeGoals > $awayGoals => $fixture->home_team_id,
                    $awayGoals > $homeGoals => $fixture->away_team_id,
                    default => null,
                };

                Prediction::query()->firstOrCreate(
                    ['user_id' => $userId, 'fixture_id' => $fixture->id],
                    [
                        'winner_id' => $winnerId,
                        'source' => PredictionTypes::User,
                        'visibility' => 'public',
                        'total_goals' => $homeGoals + $awayGoals,
                        'home_goals' => $homeGoals,
                        'away_goals' => $awayGoals,
                        'confidence' => (string) $confidenceLevels[$index],
                    ],
                );

                $index++;
            });
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
        return app(CompetitionContext::class)->season();
    }
}
