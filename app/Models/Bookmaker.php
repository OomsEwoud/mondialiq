<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bookmaker extends Model
{
    protected $fillable = [
        'name'
    ];

    public function fixtureOdds()
    {
        return $this->hasMany(FixtureOdd::class);
    }
}
