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
        'expected_score' => null,
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
        return $this->predictionContextService->promptBlock($fixture);
    }

    private function guidanceBlock(): string
    {
        return implode(PHP_EOL, [
            'Important guidance:',
            '- Treat market odds as the strongest external signal.',
            '- Treat API predictions as a secondary signal.',
            '- Use team stats, standings, head-to-head and missing players as supporting context.',
            '- If market odds and API prediction disagree, mention the disagreement.',
            '- Do not claim certainty.',
            '- Explain uncertainty where relevant.',
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
            '  "expected_score": null,',
            '  "explanation": "",',
            '  "key_factors": []',
            '}',
        ]);
    }
}
