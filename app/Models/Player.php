<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    protected $fillable = [
        'external_id',
        'country_id',
        'first_name',
        'last_name',
        'display_name',
        'birth_date',
        'photo_url',
        'position',
        'number',
    ];

    protected $casts = [
        'birth_date' => 'datetime',
        'number' => 'integer',
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function missingFixtures(): BelongsToMany
    {
        return $this->belongsToMany(Fixture::class, 'missing_players')->withTimestamps();
    }

    public function fixturePlayers(): HasMany
    {
        return $this->hasMany(FixturePlayer::class);
    }

    public function fixtureEvents(): HasMany
    {
        return $this->hasMany(FixtureEvent::class);
    }

    public function assistFixtureEvents(): HasMany
    {
        return $this->hasMany(FixtureEvent::class, 'assist_id');
    }

    public function playerFixtureStats(): HasMany
    {
        return $this->hasMany(PlayerFixtureStat::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'teams_has_players')->withPivot('is_active')->withTimestamps();
    }
}
