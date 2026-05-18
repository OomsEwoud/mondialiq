<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeatherLog extends Model
{
    protected $fillable = [
        'fixture_id',
        'temperature',
        'humidity',
        'condition',
    ];

    protected $casts = [
        'temperature' => 'float',
        'humidity' => 'integer',
    ];

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }
}
