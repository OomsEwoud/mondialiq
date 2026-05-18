<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BetType extends Model
{
    protected $fillable = [
        'name',
    ];

    public function fixtureOdds(): HasMany
    {
        return $this->hasMany(FixtureOdd::class);
    }
}
