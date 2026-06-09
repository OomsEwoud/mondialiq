<?php

namespace App\Http\Resources;

use App\Models\Prediction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FixtureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $aiPrediction = $this->aiPredictionForResponse();
        $userPrediction = $this->userPredictionForResponse();

        return [
            'id' => $this->id,
            ...$this->teamAttributes(),
            'date' => $this->match_date->format('d M'),
            'dateValue' => $this->match_date->format('Y-m-d'),
            'time' => $this->match_date->format('H:i'),
            'kickoffAt' => $this->kickoffAt(),
            'round' => $this->round_name,
            'status' => $this->status_long ?? $this->status_short ?? '',
            'elapsedTime' => $this->elapsed_time,
            'score' => $this->scoreAttributes(),
            'prediction' => $this->predictionChances(),
            'hasAiPrediction' => (bool) $aiPrediction,
            'aiPrediction' => $this->aiPredictionAttributes($aiPrediction),
            'userPrediction' => $this->userPredictionAttributes($userPrediction),
        ];
    }

    private function teamAttributes(): array
    {
        return [
            'homeTeamId' => $this->homeTeam->id,
            'homeTeam' => $this->homeTeam->name,
            'homeTeamShort' => $this->homeTeam->code,
            'homeTeamLogo' => $this->homeTeam->logo_url,
            'awayTeamId' => $this->awayTeam->id,
            'awayTeam' => $this->awayTeam->name,
            'awayTeamShort' => $this->awayTeam->code,
            'awayTeamLogo' => $this->awayTeam->logo_url,
        ];
    }

    private function scoreAttributes(): array
    {
        return [
            'fulltime' => [
                'home' => $this->fulltime_home_goals,
                'away' => $this->fulltime_away_goals,
            ],
            'extratime' => [
                'home' => $this->extratime_home_goals,
                'away' => $this->extratime_away_goals,
            ],
            'penalties' => [
                'home' => $this->penalty_home_goals,
                'away' => $this->penalty_away_goals,
            ],
        ];
    }

    private function predictionChances(): ?array
    {
        $prediction = $this->predictionForResponse();

        if (! $prediction) {
            return null;
        }

        return [
            'homeWin' => $prediction->home_chance,
            'draw' => $prediction->draw_chance,
            'awayWin' => $prediction->away_chance,
        ];
    }

    private function aiPredictionAttributes(?Prediction $prediction): ?array
    {
        if (! $prediction) {
            return null;
        }

        return [
            ...$this->basePredictionAttributes($prediction),
            'advice' => $prediction->advice,
        ];
    }

    private function userPredictionAttributes(?Prediction $prediction): ?array
    {
        if (! $prediction) {
            return null;
        }

        return $this->basePredictionAttributes($prediction);
    }

    private function basePredictionAttributes(Prediction $prediction): array
    {
        return [
            'winnerId' => $prediction->winner_id,
            'outcome' => $this->predictionOutcome($prediction),
            'label' => $this->predictionLabel($prediction),
            'homeScore' => $prediction->home_goals,
            'awayScore' => $prediction->away_goals,
            'confidence' => $prediction->confidence,
            'points' => $prediction->awardedPoints(),
            'pointsAwarded' => $prediction->hasAwardedPoints(),
            'validatedAt' => $prediction->points_awarded_at?->toIso8601String(),
            'isBoosted' => $prediction->relationLoaded('scoreboardPredictions')
                ? ($prediction->scoreboardPredictions->first()?->is_boosted ?? false)
                : false,
        ];
    }

    private function predictionForResponse(): ?Prediction
    {
        if ($this->relationLoaded('aiPrediction')) {
            return $this->aiPrediction;
        }

        if ($this->relationLoaded('userPredictions')) {
            return $this->userPredictions->first();
        }

        return $this->apiPrediction;
    }

    private function aiPredictionForResponse(): ?Prediction
    {
        if ($this->relationLoaded('aiPrediction')) {
            return $this->aiPrediction;
        }

        return null;
    }

    private function userPredictionForResponse(): ?Prediction
    {
        if ($this->relationLoaded('userPredictions')) {
            return $this->userPredictions->first();
        }

        return null;
    }

    private function predictionLabel(Prediction $prediction): string
    {
        if (! $prediction->winner_id) {
            return 'Draw';
        }

        if ($prediction->relationLoaded('winner')) {
            return $prediction->winner?->name ?? 'Team pick';
        }

        return match ($prediction->winner_id) {
            $this->home_team_id => $this->homeTeam->name,
            $this->away_team_id => $this->awayTeam->name,
            default => 'Team pick',
        };
    }

    private function predictionOutcome(Prediction $prediction): string
    {
        return match ($prediction->winner_id) {
            $this->home_team_id => 'home',
            $this->away_team_id => 'away',
            default => 'draw',
        };
    }
}
