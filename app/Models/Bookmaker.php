<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
])]
class Bookmaker extends Model
{
    public function fixtureOdds(): HasMany
    {
        return $this->hasMany(FixtureOdd::class);
    }
}
