<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Referee extends Model
{
    protected $fillable = [
        'name',
    ];

    public function fixtures(): HasMany
    {
        return $this->hasMany(Fixture::class);
    }
}
