<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\MissingPlayer;
use App\Models\Player;
use Illuminate\Support\Facades\Schema;

class MissingPlayersSummaryService
{
    private const PLAYER_LIMIT = 5;

    public function summarize(Fixture $fixture): array
    {
        $fixture->loadMissing(['homeTeam:id,name', 'awayTeam:id,name']);
        $hasType = Schema::hasColumn('missing_players', 'type');
        $hasReason = Schema::hasColumn('missing_players', 'reason');

        $summary = [
            'home_team_name' => $fixture->homeTeam?->name,
            'away_team_name' => $fixture->awayTeam?->name,
            'home_missing_count' => 0,
            'away_missing_count' => 0,
            'home_questionable_count' => $hasType ? 0 : null,
            'away_questionable_count' => $hasType ? 0 : null,
            'home_missing_players' => [],
            'away_missing_players' => [],
        ];

        $missingPlayers = MissingPlayer::query()
            ->with(['player.teams:id,name'])
            ->where('fixture_id', $fixture->id)
            ->get();

        foreach ($missingPlayers as $missingPlayer) {
            $side = $this->sideForPlayer($missingPlayer->player, $fixture);

            if ($side === null) {
                continue;
            }

            $this->addMissingPlayerToSummary($summary, $side, $missingPlayer, $hasType, $hasReason);
        }

        return $summary;
    }

    public function promptBlock(Fixture $fixture): string
    {
        $summary = $this->summarize($fixture);

        if ($summary['home_missing_count'] === 0 && $summary['away_missing_count'] === 0) {
            return implode(PHP_EOL, [
                'Missing players summary:',
                '- No missing players reported.',
            ]);
        }

        $lines = [
            'Missing players summary:',
            '- '.$this->countLine($summary['home_team_name'], $summary['home_missing_count']),
            '- '.$this->countLine($summary['away_team_name'], $summary['away_missing_count']),
        ];

        if ($summary['home_missing_players'] !== []) {
            $lines[] = '- '.$this->playersLine($summary['home_team_name'], $summary['home_missing_players']);
        }

        if ($summary['away_missing_players'] !== []) {
            $lines[] = '- '.$this->playersLine($summary['away_team_name'], $summary['away_missing_players']);
        }

        return implode(PHP_EOL, $lines);
    }

    private function sideForPlayer(?Player $player, Fixture $fixture): ?string
    {
        if ($player === null) {
            return null;
        }

        $teamIds = $player->teams->pluck('id');

        if ($fixture->home_team_id !== null && $teamIds->contains($fixture->home_team_id)) {
            return 'home';
        }

        if ($fixture->away_team_id !== null && $teamIds->contains($fixture->away_team_id)) {
            return 'away';
        }

        return null;
    }

    private function addMissingPlayerToSummary(
        array &$summary,
        string $side,
        MissingPlayer $missingPlayer,
        bool $hasType,
        bool $hasReason,
    ): void {
        $countKey = "{$side}_missing_count";
        $questionableCountKey = "{$side}_questionable_count";
        $playersKey = "{$side}_missing_players";

        $summary[$countKey]++;

        if ($hasType && $this->isQuestionable($missingPlayer->type)) {
            $summary[$questionableCountKey]++;
        }

        if (count($summary[$playersKey]) >= self::PLAYER_LIMIT) {
            return;
        }

        $summary[$playersKey][] = [
            'name' => $this->playerName($missingPlayer->player),
            'type' => $hasType ? $missingPlayer->type : null,
            'reason' => $hasReason ? $missingPlayer->reason : null,
        ];
    }

    private function isQuestionable(?string $type): bool
    {
        return in_array(strtolower((string) $type), ['questionable', 'doubtful'], true);
    }

    private function playerName(?Player $player): string
    {
        if ($player === null) {
            return 'Unknown player';
        }

        return $player->display_name
            ?? trim("{$player->first_name} {$player->last_name}")
            ?: 'Unknown player';
    }

    private function countLine(?string $teamName, int $count): string
    {
        $teamName ??= 'Unknown team';
        $label = $count === 1 ? 'missing player' : 'missing players';

        return "{$teamName}: {$count} {$label}";
    }

    private function playersLine(?string $teamName, array $players): string
    {
        $teamName ??= 'Unknown team';
        $names = collect($players)
            ->pluck('name')
            ->implode(', ');

        return "{$teamName} missing players include: {$names}";
    }
}
