<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venue extends Model
{
    protected $fillable = [
        'external_id',
        'name',
        'city',
        'country_id',
        'capacity',
        'photo_url',
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function fixtures(): HasMany
    {
        return $this->hasMany(Fixture::class);
    }
}
