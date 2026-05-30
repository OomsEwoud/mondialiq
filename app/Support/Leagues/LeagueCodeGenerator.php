<?php

namespace App\Support\Leagues;

use App\Models\Scoreboard;
use Illuminate\Support\Str;

class LeagueCodeGenerator
{
    public function generate(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while ($this->exists($code));

        return $code;
    }

    private function exists(string $code): bool
    {
        return Scoreboard::query()
            ->where('code', $code)
            ->exists();
    }
}
