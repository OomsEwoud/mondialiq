<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'fixture_id',
    'temperature',
    'humidity',
    'condition',
])]
class WeatherLog extends Model
{
    protected function casts(): array
    {
        return [
            'temperature' => 'float',
            'humidity' => 'integer',
        ];
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }
}
