<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FixtureStat extends Model
{
    protected $fillable = [
        'fixture_id',
        'team_id',
        'name',
        'value'
    ];

    protected $casts = [
        'value' => 'float',
    ];

    public function fixture()
    {
        return $this->belongsTo(Fixture::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
