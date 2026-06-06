<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'fifa_code',
    'flag_url',
])]
class Country extends Model
{
    public function leagues(): HasMany
    {
        return $this->hasMany(League::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    public function coaches(): HasMany
    {
        return $this->hasMany(Coach::class);
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function venues(): HasMany
    {
        return $this->hasMany(Venue::class);
    }
}
