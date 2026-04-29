<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeatherLog extends Model
{
    protected $fillable = [
        'fixture_id',
        'temperature',
        'humidity',
        'condition'
    ];

    protected $casts = [
        'temperature' => 'float',
        'humidity' => 'integer',
    ];

    public function fixture()
    {
        return $this->belongsTo(Fixture::class);
    }
}
