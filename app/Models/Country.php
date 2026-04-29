<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    protected $fillable = [
        'name',
        'fifa_code',
        'flag_url',
    ];

    public function leagues()
    {
        return $this->hasMany(League::class);
    }

    public function teams()
    {
        return $this->hasMany(Team::class);
    }

    public function coaches()
    {
        return $this->hasMany(Coach::class);
    }

    public function players()
    {
        return $this->hasMany(Player::class);
    }

    public function venues()
    {
        return $this->hasMany(Venue::class);
    }
}
