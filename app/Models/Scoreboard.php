<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Scoreboard extends Model
{
    protected $fillable = [
        'name',
        'code',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_has_scoreboards');
    }
}
