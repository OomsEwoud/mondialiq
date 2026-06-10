<?php

namespace Database\Factories;

use App\Models\Scoreboard;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Scoreboard>
 */
class ScoreboardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'code' => $this->faker->unique()->regexify('[A-Z0-9]{8}'),
            'visibility' => 'public',
            'owner_id' => \App\Models\User::factory(),
            'is_active' => true,
        ];
    }
}
