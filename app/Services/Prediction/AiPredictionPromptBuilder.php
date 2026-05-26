<?php

namespace App\Services\Prediction;

use App\Models\Fixture;

class AiPredictionPromptBuilder
{
    public const EXPECTED_JSON_FORMAT = [
        'predicted_outcome' => 'home|draw|away|home_or_draw|away_or_draw|home_or_away',
        'home_chance' => 0,
        'draw_chance' => 0,
        'away_chance' => 0,
        'confidence' => 0,
        'expected_score' => 'home-away|null',
        'explanation' => '',
        'key_factors' => [],
    ];

    public function __construct(
        private readonly PredictionContextService $predictionContextService,
    ) {
    }

    public function build(Fixture $fixture): string
    {
        return implode(PHP_EOL.PHP_EOL, [
            $this->instructions(),
            'Context:',
            $this->context($fixture),
        ]);
    }

    public function instructions(): string
    {
        return implode(PHP_EOL.PHP_EOL, [
            'You are an AI football prediction analyst for MondialIQ.',
            'Use the provided context to predict the match outcome.',
            $this->guidanceBlock(),
            $this->expectedJsonFormatBlock(),
        ]);
    }

    public function context(Fixture $fixture): string
    {
        return $this->predictionContextService->promptBlock($fixture, includeGuidance: false);
    }

    private function guidanceBlock(): string
    {
        return implode(PHP_EOL, [
            'Important guidance:',
            '- Treat market odds as the strongest external signal.',
            '- Treat API predictions as a secondary signal.',
            '- Use team stats, standings, head-to-head and missing players as supporting context.',
            '- Do not assume the listed home team has home advantage. In finals and neutral-venue matches, home/away is usually administrative.',
            '- For World Cup matches, only host nations should receive a home-country advantage; other listed home teams should not.',
            '- If market odds and API prediction disagree, mention the disagreement.',
            '- Do not claim certainty.',
            '- Explain uncertainty where relevant.',
            '- Include expected_score as "home-away" when the context contains a market most likely score or enough goal data.',
            '- Use expected_score null only when there is not enough score-related data.',
            '- Return a JSON object only.',
        ]);
    }

    private function expectedJsonFormatBlock(): string
    {
        return implode(PHP_EOL, [
            'Expected JSON format:',
            '{',
            '  "predicted_outcome": "home|draw|away|home_or_draw|away_or_draw|home_or_away",',
            '  "home_chance": 0,',
            '  "draw_chance": 0,',
            '  "away_chance": 0,',
            '  "confidence": 0,',
            '  "expected_score": "home-away|null",',
            '  "explanation": "",',
            '  "key_factors": []',
            '}',
        ]);
    }
}
